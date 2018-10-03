import {Router, Request} from "express";
import {S3} from "aws-sdk";
import * as uuid from "uuid/v4";
import * as archiver from "archiver";
import {Logger} from "log4js";
import {createWriteStream} from "fs";
import {join} from "path";

import {ResponseCodes} from "../../../models/util/response/responseCodes";
import {ZipState, ZipStatus} from "../../../models/util/global/zipStateModel";

interface IPrepareBulkResumeRequest {
    resumes: string[];
}

class PrepareBulkResumeResponse {
    downloadId: string
    authToken: string
    
    constructor(downloadId: string, authToken: string) {
        this.downloadId = downloadId;
        this.authToken = authToken;
    }
}

const router = Router();

function setZipSuccess(logger: Logger, req: Request, tempId: string) {
    (req.app.get("zipState")[tempId] as ZipState).status = ZipStatus.READY;
    logger.info("Resume Zip Ready, ID: " + tempId);
}

function setZipFail(logger: Logger, req: Request, tempId: string, err: archiver.ArchiverError) {
    (req.app.get("zipState")[tempId] as ZipState).status = ZipStatus.FAILED;
    logger.info("Resume Zip Ready, ID: " + tempId);
}

router.post("/", async (req, res, next) => {
    const prepareBulkRequest = req.body as IPrepareBulkResumeRequest;
    if (!prepareBulkRequest || !prepareBulkRequest.resumes) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        next(new Error("Request missing resume list parameter"));
        return;
    }
    try {
        const tempId = uuid();
        const authToken = uuid();
        const tempZipFileName = "resumes-bulk-" + tempId + ".zip";
        const s3 = new S3();
        const archive = archiver("zip", {zlib: {level: req.app.get("config").zlibCompressionLevel}});
        prepareBulkRequest.resumes.forEach((resume) => {
            const awsParams = {Bucket: req.app.get("config").awsResumeBucket as string, Key: resume};
            const arr = resume.split("/");
            const fileName = arr[arr.length - 1];
            const resumeObject = s3.getObject(awsParams).createReadStream();
            archive.append(resumeObject, {name: fileName});
        });
        const logger = req.app.get("logger");
        logger.info(req.method + " " + req.originalUrl + ": Preparing Bulk Download For: " + tempId);
        const resumeFile = createWriteStream(join(process.cwd(), req.app.get("config").zipDirectory, tempZipFileName))
        resumeFile.once("open", function() {
            archive.pipe(resumeFile);
        });
        resumeFile.on("error", setZipFail.bind(null, next));
        archive.on("finish", () => {
            resumeFile.end();
            setZipSuccess(logger, req, tempId);
        });
        archive.on("error", (err) => {
            setZipFail(logger, req, tempId, err);
        });
        archive.finalize();

        // Set the zip state
        req.app.get("zipState")[tempId] = new ZipState(ZipStatus.PREPARING, Date.now() + req.app.get("config").zipExpires, req.id as string, authToken);

        // Craft the response
        const response = new PrepareBulkResumeResponse(tempId, authToken);
        res.status(ResponseCodes.SUCCESS);
        req.routed = true;
        req.returnObject = response;
        next();
    } catch (err) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        next(err)
    }
});

export default router;
