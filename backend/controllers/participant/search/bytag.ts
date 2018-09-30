import {Router} from "express";

import {ResponseCodes} from "../../../models/util/response/responseCodes";
import { Participant, searchByTag } from "../../../models/participant/participantModel";

interface ISearchByTagRequest {
    tag: string;
}

export class SearchByTagResponse {
    public participants: Participant[];

    constructor(participants: Participant[]) {
        this.participants = participants;
    }
}

export const router = Router();

router.post("/", async (req, res, next) => {
    const searchBody = req.body as ISearchByTagRequest;
    if (!searchBody || !searchBody.tag) {
        res.status(ResponseCodes.ERROR_BAD_REQUEST)
        next(new Error("Request missing search parameters"));
        return;
    }
    try {
        const participants = await searchByTag(req.app.get("config").databaseConnectionString, req.id as string, searchBody.tag);
        const response: SearchByTagResponse = new SearchByTagResponse(participants);
        res.status(ResponseCodes.SUCCESS);
        req.routed = true;
        req.returnObject = response;
        next();
    } catch (err) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        req.routed = true;
        next(err);
    }
});

export default router;
