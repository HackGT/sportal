import {Router} from "express";
import {format} from "util";

import {ResponseCodes} from "../../models/util/response/responseCodes";
import {checkInUserWithSponsor} from "../../util/graphql/checkInRequest";

interface CheckinRequest {
    registration_id: string;
}

export const router = Router();

router.post("/", async (req, res, next) => {
    const checkinRequest = req.body as CheckinRequest;
    if (!checkinRequest || !checkinRequest.registration_id) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        next(new Error("Request missing search parameters"));
        return;
    }
    try {
        const sponsor_tag = format(req.app.get("config").graphqlCheckinSponsorTagTemplate, req.sponsor as string);
        const response = await checkInUserWithSponsor(req.app.get("config").graphqlCheckinApiKey, req.app.get("config").graphqlCheckinEndpoint, checkinRequest.registration_id, sponsor_tag);
        if (!response.tags) {
            res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
            req.routed = true;
            next(new Error("Unable to submit tag"));
            return;
        }
        let success = false;
        response.tags.forEach(tag => {
            if (tag.tag.name === sponsor_tag) {
                success = true;
            }
        });
        if (!success) {
            res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
            req.routed = true;
            next(new Error("Unable to submit tag"));
            return;
        }
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
