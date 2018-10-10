import {Router} from "express";
import {Lambda} from "aws-sdk";
import * as uuid from "uuid/v5"
import {Logger} from "log4js";

import {ResponseCodes} from "../../../models/util/response/responseCodes";
import {ZipState, ZipStatus} from "../../../models/util/global/zipStateModel";
import {LastDownload} from "../../../models/util/global/lastDownloadModel";
import {getParticipantResumeKey} from "../../../models/participant/participantModel";

interface IPrepareBulkResumeRequest {
    registration_ids: string[];
}

class LambdaZipResumesRequest {
    files: string[];
    zipFileName: string;

    constructor(files: string[], zipFileName: string) {
        this.files = files;
        this.zipFileName = zipFileName;
    }
}

class PrepareBulkResumeResponse {
    downloadId: string
    
    constructor(downloadId: string) {
        this.downloadId = downloadId;
    }
}

const router = Router();

router.post("/", async (req, res, next) => {
    const prepareBulkRequest = req.body as IPrepareBulkResumeRequest;
    if (!prepareBulkRequest || !prepareBulkRequest.registration_ids || !prepareBulkRequest.registration_ids.length) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        next(new Error("Request missing registration ID list parameter or liset is empty"));
        return;
    }
    const now = Date.now();
    try {
        let resumes: string[] = [];
        let i: number;
        for (i = 0; i < prepareBulkRequest.registration_ids.length; i++) {
            const resume = await getParticipantResumeKey(req.app.get("dbConnection"), prepareBulkRequest.registration_ids[i]);
            if (resume) {
                resumes.push(resume);
            }
        }
        // Hash the resume list for caching purposes
        resumes.sort();
        const zipId = uuid(resumes.join(), req.app.get("config").zipUUIDNamespace);
        const tempZipFileName = "resumes-bulk-" + zipId + ".zip";

        // Preparing bulk download
        const logger: Logger = req.app.get("logger");

        // Set download zip state
        let zipState = (req.app.get("zipStateMap") as Map<string, ZipState>).get(zipId);
        if (!zipState) {
            zipState = new ZipState(ZipStatus.PREPARING, 0, new Set<string>());
            (req.app.get("zipStateMap") as Map<string, ZipState>).set(zipId, zipState);
        }
        zipState.creators.add(req.id as string);

        // Craft the response
        const response = new PrepareBulkResumeResponse(zipId);
        res.status(ResponseCodes.ACCEPTED);
        req.routed = true;
        req.returnObject = response;
        next();

        // Only prepare a new zip if expired or does not exist
        if (now >= zipState.expires) {
            // Check if the user is exceeding the rate limit
            let userLastDownloaded = (req.app.get("lastDownloadMap") as Map<string, LastDownload>).get(req.id as string) as LastDownload;
            if (userLastDownloaded && now < (userLastDownloaded.lastDownloaded + req.app.get("config").bulkDownloadLimit)) {
                req.routed = true;
                res.status(ResponseCodes.ERROR_TOO_MANY_REQUESTS);
                next(new Error("Too many bulk download requests, please try again in a few minutes!"));
                return;
            }
            logger.info(req.method + " " + req.originalUrl + ": Requesting a new Bulk Download Link For UUID: " + zipId);
            zipState.status = ZipStatus.PREPARING;
            zipState.expires = now + req.app.get("config").zipExpires;
            const lambda = new Lambda();
            const params = {
                FunctionName: "zipResumes",
                Payload: JSON.stringify(new LambdaZipResumesRequest(resumes, tempZipFileName))
            };
            const url =  JSON.parse((await lambda.invoke(params).promise()).Payload as string).url;
            zipState.resumeUrl = url;
            zipState.status = ZipStatus.READY;
            logger.info(req.method + " " + req.originalUrl + ": Bulk Download Request Complete For UUID: " + zipId);

            // Record the user's most recent download for rate limiting
            (req.app.get("lastDownloadMap") as Map<string, LastDownload>).set(req.id as string, new LastDownload(now));
        } else {
            logger.info(req.method + " " + req.originalUrl + ": Bulk Download link already exists and is not expired for UUID: " + zipId);
        }
    } catch (err) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        next(err)
    }
});

export default router;
