import {Router} from "express";
import {compare} from "bcryptjs";

import {IUser, getUserProfile} from "../../models/user/userModel";
import {createToken} from "../../models/util/jwt/tokenModel";
import {ResponseCodes} from "../../models/util/response/responseCodes";

class LoginRequest {
    public email: string;
    public password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}

class LoginResponse {
    public jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }
}

const router = Router();

router.post("/", async (req, res, next) => {
    const loginRequest = req.body as LoginRequest;
    if (!loginRequest || !loginRequest.email || !loginRequest.password) {
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        req.routed = true;
        next(new Error("Request missing login parameters"));
    }
    let profile: IUser;
    try {
        profile = await getUserProfile(req.app.get("config").databaseConnectionString, loginRequest.email);
    }
    catch (err) {
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        next(err);
        return;
    }
    try {
        const validCredentials = await compare(loginRequest.password, profile.password);
        if (validCredentials) {
            const loginResponse = new LoginResponse(createToken(loginRequest.email as string,
                req.app.get("config").authSecret, req.app.get("config").authExp));
            res.status(ResponseCodes.SUCCESS);
            req.returnObject = loginResponse;
            req.routed = true;
            next();
        }
        else {
            res.status(ResponseCodes.ERROR_UNAUTHORIZED);
            req.routed = true;
            next(new Error("Invalid Credentials"));
        }
    }
    catch(err) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        req.routed = true;
        next(err);
        return;
    }
});

export default router;
