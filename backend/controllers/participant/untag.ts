import {Router} from "express";

import {ResponseCodes} from "../../models/util/response/responseCodes";
import {untagParticipant} from "../../models/participant/participantModel";

interface UntagRequest {
    registration_id: string;
    tag: string;
}

export const router = Router();

router.post("/", async (req, res, next) => {
    const searchBody = req.body as UntagRequest;
    if (!searchBody || !searchBody.tag || !searchBody.registration_id) {
        res.status(ResponseCodes.ERROR_BAD_REQUEST)
        next(new Error("Request missing search parameters"));
        return;
    }
    try {
        await untagParticipant(req.app.get("config").databaseConnectionString, searchBody.registration_id, searchBody.tag);
        res.status(ResponseCodes.SUCCESS);
        req.routed = true;
        next();
    } catch (err) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        req.routed = true;
        next(err);
    }
});

export default router;
