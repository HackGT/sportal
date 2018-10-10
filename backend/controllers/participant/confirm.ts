import {Router} from "express";

import {setParticipantOptedIn} from "../../models/participant/participantModel";
import {ResponseCodes} from "../../models/util/response/responseCodes";
import {retrieveTokenFromHeader, verifyJWT} from "../../middlewares/auth/verify";

interface IOptInRequest {
    registration_id: string;
    opt_in: boolean;
    apiKey: string;
    jwt: string;
}

const router = Router();

router.post('/', async (req, res, next) => {
    const confirmBody = req.body as IOptInRequest;
    if (!confirmBody || !confirmBody.registration_id || (!confirmBody.apiKey && !confirmBody.jwt)) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        next(new Error("Request missing search parameters"));
        return;
    }
    let authorized = false;
    if (confirmBody.apiKey && confirmBody.apiKey === req.app.get("config").serverAdminApiKey) {
        authorized = true;
    } else {
        try {
            const payload = verifyJWT(retrieveTokenFromHeader(req), req.app.get("config").authSecret);
            req.id = payload.id;
            req.sponsor = payload.sponsor;
            authorized = true;
        } catch (err) {
            authorized = false;
        }
    }
    if (!authorized) {
        req.routed = true;
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        next(new Error("Invalid Credentials"));
        return;
    }
    try {
        await setParticipantOptedIn(req.app.get("dbConnection"), confirmBody.registration_id, confirmBody.opt_in);
        res.status(ResponseCodes.SUCCESS);
        req.routed = true;
        next();
    } catch (err) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        req.routed = true;
        next(err)
    }
});

export default router;
