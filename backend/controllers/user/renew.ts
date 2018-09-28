import {Router} from "express";

import {createToken} from "../../models/util/jwt/tokenModel";
import {ResponseCodes} from "../../models/util/response/responseCodes";

export class RenewResponse {
    public jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }
}

export const router = Router();

router.get("/", (req, res, next) => {
    const renewResponse = new RenewResponse(createToken(req.id as string,
        req.app.get("config").authSecret, req.app.get("config").authExp));
    res.status(ResponseCodes.SUCCESS);
    req.returnObject = renewResponse;
    req.routed = true;
    next();
});

export default router;
