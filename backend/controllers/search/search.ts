import {Router} from "express";
import {rawRequest} from "graphql-request";

import ResponseCodes from "../../models/response/responseCodes";

export class SearchRequest {
    public search: string;
    public n: number;
    public offset: number;
}

export class SearchResponse {
    public registration_ids: string[];

    constructor(registration_ids: string[]) {
        this.registration_ids = registration_ids;
    }
}

export const router = Router();

router.post("/", (req, res, next) => {
    const searchResponse = new SearchResponse();
    res.status(ResponseCodes.SUCCESS);
    req.returnObject = searchResponse;
    next();
});

export default router;
