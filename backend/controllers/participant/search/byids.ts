import {Router} from "express";

import {ResponseCodes} from "../../../models/util/response/responseCodes";
import {Participant, searchByIds} from "../../../models/participant/participantModel";

interface ISearchByIdRequest {
    registration_ids: string[];
}

export class SearchByIdResponse {
    public participants: Participant[];

    constructor(participants: Participant[]) {
        this.participants = participants;
    }
}

export const router = Router();

router.post("/", async (req, res, next) => {
    const searchBody = req.body as ISearchByIdRequest;
    if (!searchBody || !searchBody.registration_ids) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        next(new Error("Request missing search parameters"));
        return;
    }
    try {
        const participants = await searchByIds(req.app.get("dbConnection"), req.sponsor as string, searchBody.registration_ids);
        const response: SearchByIdResponse = new SearchByIdResponse(participants);
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
