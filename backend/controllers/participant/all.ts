import {Router} from "express";

import {Participant, getAllParticipants} from "../../models/participant/participantModel";
import {ResponseCodes} from "../../models/util/response/responseCodes";

export class GetAllResponse {
    public participants: Participant[];

    constructor(participants: Participant[]) {
        this.participants = participants;
    }
}

const router = Router();

router.get('/', async (req, res, next) => {
    try {
        const participants = await getAllParticipants(req.app.get("dbConnection"), req.id as string);
        const getAllResponse = new GetAllResponse(participants);
        res.status(ResponseCodes.SUCCESS);
        req.returnObject = getAllResponse;
        req.routed = true;
        next();
    } catch (err) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        req.routed = true;
        next(err)
    }
});

export default router;
