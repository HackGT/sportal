import {Router} from "express";
import {S3} from "aws-sdk";
import {tmpNameSync} from "tmp";
import * as archiver from "archiver";

import {ResponseCodes} from "../../models/response/responseCodes";

interface IGetBulkResumeRequest {
    resumes: string[];
}

const router = Router();

router.post("/", async (req, res, next) => {
    try {
        const resumeBulkRequest = req.body as IGetBulkResumeRequest;
        const s3 = new S3();
        const tempZipFileName = tmpNameSync({prefix: "resumes-bulk-", postfix: ".zip"});
        const archive = archiver("zip", {zlib: {level: req.app.get("config").zlibCompressionLevel}});
        res.status(ResponseCodes.SUCCESS);
        res.header("Content-type", "application/octet-stream");
        res.header("Content-Disposition", "attachment; filename=\"" + tempZipFileName + "\"");
        archive.pipe(res);
        resumeBulkRequest.resumes.forEach(resume => {
            const awsParams = {Bucket: req.app.get("config").awsResumeBucket as string, Key: resume};
            const arr = resume.split("/");
            const fileName = arr[arr.length - 1];
            const resumeObject = s3.getObject(awsParams).createReadStream();
            archive.append(resumeObject, {name: fileName});
        });
        
    } catch (err) {
        next(err)
    }
});

export default router;
