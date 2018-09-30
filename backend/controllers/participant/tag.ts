import {Router} from "express";

import {ResponseCodes} from "../../models/util/response/responseCodes";
import {tagParticipant} from "../../models/participant/participantModel";

interface TagRequest {
    registration_id: string;
    tag: string;
}

interface TagResponse {
    tags: string[]
}

export const router = Router();

router.post("/", async (req, res, next) => {
    const searchBody = req.body as TagRequest;
    if (!searchBody || !searchBody.tag || !searchBody.registration_id) {
        res.status(ResponseCodes.ERROR_BAD_REQUEST)
        next(new Error("Request missing search parameters"));
        return;
    }
    try {
        const tags = await tagParticipant(req.app.get("config").databaseConnectionString, req.id as string, searchBody.registration_id, searchBody.tag);
        res.status(ResponseCodes.SUCCESS);
        req.routed = true;
        req.returnObject = tags as TagResponse;
        next();
    } catch (err) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        req.routed = true;
        next(err);
    }
});

export default router;
