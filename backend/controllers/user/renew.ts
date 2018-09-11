import {Router, Request, Response, NextFunction} from "express";

import {createToken} from "../../models/jwt/tokenModel";
import ResponseCodes from "../../models/response/responseCodes";

class RenewResponse {
    jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }
}

const router = Router();

router.get('', function(req: Request, res: Response, next: NextFunction) {
    const renewResponse = new RenewResponse(createToken(<string> req.id,
        req.app.get('config').authSecret, req.app.get('config').authExp));
    res.status(ResponseCodes.SUCCESS);
    res.json(renewResponse);
});

export default router;