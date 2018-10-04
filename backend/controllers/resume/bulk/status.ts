import {Router} from "express";

import {ResponseCodes} from "../../../models/util/response/responseCodes";
import {ZipState} from "../../../models/util/global/zipStateModel";

interface IBulkStatusRequest {
    downloadId: string
}

export class BulkStatusResponse {
    public zipStatus: string;

    constructor(zipStatus: string) {
        this.zipStatus = zipStatus;
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
    if (req.id as string !== zipState.creator) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        next(new Error("You cannot access this zip file!"));
        return;
    }
    const response = new BulkStatusResponse(zipState.status);
    res.status(ResponseCodes.SUCCESS);
    req.returnObject = response;
    req.routed = true;
    next();
});

export default router;
