import {Router, Request, Response, NextFunction} from "express";
import {compare} from "bcrypt";

import {User, getUserProfile} from "../../models/user/userModel";
import {createToken} from "../../models/jwt/tokenModel";
import ResponseCodes from "../../models/response/responseCodes";

class LoginRequest {
    email: string;
    password: string;

    constructor(email: string, password: string) {
        this.email = email;
        this.password = password;
    }
}

class LoginResponse {
    jwt: string;

    constructor(jwt: string) {
        this.jwt = jwt;
    }
}

const router = Router();

router.post('', function(req: Request, res: Response, next: NextFunction) {
    const loginRequest = <LoginRequest> req.body;
    getUserProfile(loginRequest.email).catch(function(err) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
        next(err);
    }).then(function(user: User) {
        return compare(loginRequest.password, user.password);
    }).then(function() {
        const loginResponse = new LoginResponse(createToken(<string> loginRequest.email, 
            req.app.get('config').authSecret, req.app.get('config').authExp));
        res.status(ResponseCodes.SUCCESS);
        res.json(loginResponse);
    }).catch(function(err) {
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        err.message = 'Invalid Credentials';
        next(err);
    });
});

export default router;