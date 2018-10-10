import {Router} from "express";
import {S3} from "aws-sdk";

import bulk from "./resume/bulk";
import {ResponseCodes} from "../models/util/response/responseCodes";
import {getParticipantResumeKey} from "../models/participant/participantModel";

interface IGetResumeRequest {
    registration_id: string;
}

class GetResumeResponse {
    resumeUrl: string;
    constructor(resumeUrl: string) {
        this.resumeUrl = resumeUrl;
    }
}

const router = Router();

router.use("/bulk", bulk);

router.post('/', async (req, res, next) => {
    const resumeRequest = req.body as IGetResumeRequest;
    if (!resumeRequest || !resumeRequest.registration_id) {
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        req.routed = true;
        next(new Error("Request missing registration ID"));
        return;
    }
    try {
        const resume = await getParticipantResumeKey(req.app.get("dbConnection"), resumeRequest.registration_id);
        console.log(resume);
        if (!resume) {
            res.status(ResponseCodes.ERROR_UNAUTHORIZED);
            req.routed = true;
            next(new Error("Cannot download resume."));
            return;
        }
        const s3 = new S3();
        const awsParams = {Bucket: req.app.get("config").awsResumeBucket as string, Key: resume, Expires: req.app.get("config").awsSignedUrlExpires};
        const signedUrl = s3.getSignedUrl("getObject", awsParams);
        const resumeResponse = new GetResumeResponse(signedUrl);
        res.status(ResponseCodes.SUCCESS);
        req.returnObject = resumeResponse;
        req.routed = true;
        next();
    } catch (err) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        req.routed = true;
        next(err)
    }
});

export default router;
