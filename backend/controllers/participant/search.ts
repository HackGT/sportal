import {Router} from "express";

import {ResponseCodes} from "../../models/util/response/responseCodes";
import { Participant, searchToken } from "../../models/participant/participantModel";

import byids from "./search/byids";
import bytag from "./search/bytag";

interface SearchRequest {
    search: string;
}

export class SearchResponse {
    public participants: Participant[];

    constructor(participants: Participant[]) {
        this.participants = participants;
    }
}

export const router = Router();

router.use("/byids", byids);
router.use("/bytag", bytag);

router.post("/", async (req, res, next) => {
    const searchBody = req.body as SearchRequest;
    if (!searchBody) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        next(new Error("Request missing search parameters"));
        return;
    }
    try {
        // SQL query for full text and by user name and email
        const participants = await searchToken(req.app.get("dbConnection"), req.id as string, searchBody.search);
        const response: SearchResponse = new SearchResponse(participants);
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
