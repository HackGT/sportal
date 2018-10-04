import {Router} from "express";
import {join} from "path";

import {ResponseCodes} from "../../../models/util/response/responseCodes";
import {ZipState} from "../../../models/util/global/zipStateModel";

interface IBulkDownloadRequest {
    downloadId: string
    authToken: string
}

export const router = Router();

router.get("/", (req, res, next) => {
    const request = req.params as IBulkDownloadRequest;
    if (!request || !request.downloadId || !request.authToken) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        next(new Error("Request missing parameters"));
        return;
    }
    const zipState = (req.app.get("zipStateMap") as Map<string, ZipState>).get(request.downloadId);
    if (!zipState) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_NOT_FOUND);
        next(new Error("Cannot find zip profile!"));
        return;
    }
    if (request.authToken !== zipState.authToken) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        next(new Error("You cannot access this zip file!"));
        return;
    }
    if (Date.now() > zipState.expires) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_GONE);
        next(new Error("This zip file link has expired!"));
        return;
    }
    res.status(ResponseCodes.SUCCESS);
    res.download(join(process.cwd(), req.app.get("config").zipDirectory, "/resumes-bulk-" + request.downloadId + ".zip"));
    req.routed = true;
});

export default router;
