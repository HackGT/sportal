import {Router} from "express";

import {ResponseCodes} from "../../../models/util/response/responseCodes";
import {ZipState, ZipStatus} from "../../../models/util/global/zipStateModel";

interface IBulkStatusRequest {
    downloadId: string
}

export class BulkStatusResponse {
    public zipStatus: string;
    public zipUrl: string;

    constructor(zipStatus: string, zipUrl: string) {
        this.zipStatus = zipStatus;
        this.zipUrl = zipUrl;
    }
}

export const router = Router();

router.post("/", (req, res, next) => {
    const request = req.body as IBulkStatusRequest;
    if (!request || !request.downloadId) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        next(new Error("Request missing download ID parameter"));
        return;
    }
    const zipState = (req.app.get("zipStateMap") as Map<string, ZipState>).get(request.downloadId);
    if (!zipState) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_NOT_FOUND);
        next(new Error("Cannot find zip profile!"));
        return;
    }
    if (!zipState.creators.has(req.id as string)) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        next(new Error("You cannot access this zip file!"));
        return;
    }
    let status: string;
    let resumeUrl: string;
    if (Date.now() >= zipState.expires) {
        status = ZipStatus.EXPIRED;
        resumeUrl = "";
    } else {
        status = zipState.status;
        resumeUrl = zipState.resumeUrl;
    }
    const response = new BulkStatusResponse(status, resumeUrl);
    res.status(ResponseCodes.SUCCESS);
    req.returnObject = response;
    req.routed = true;
    next();
});

export default router;
