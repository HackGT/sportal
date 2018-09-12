import {Router} from "express";

import {createToken} from "../../models/jwt/tokenModel";
import ResponseCodes from "../../models/response/responseCodes";

class RenewResponse {
    public jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }
}

const router = Router();

router.get("/", function(req, res, next) {
    const renewResponse = new RenewResponse(createToken(req.id as string,
        req.app.get("config").authSecret, req.app.get("config").authExp));
    res.status(ResponseCodes.SUCCESS);
    req.returnObject = renewResponse;
    next();
});

export default router;
