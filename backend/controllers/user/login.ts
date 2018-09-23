import {Router} from "express";
import {compare} from "bcrypt";

import {IUser, getUserProfile} from "../../models/user/userModel";
import {createToken} from "../../models/jwt/tokenModel";
import {ResponseCodes} from "../../models/response/responseCodes";

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
    let profile: IUser;
    try {
        profile = await getUserProfile(loginRequest.email);
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
            next();
        }
        else {
            res.status(ResponseCodes.ERROR_UNAUTHORIZED);
            next(new Error("Invalid Credentials"));
        }
    }
    catch(err) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        next(err);
        return;
    }
});

export default router;
