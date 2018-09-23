import {Request, Response, NextFunction} from "express";
import {verify} from "jsonwebtoken";
import {ResponseCodes} from "../../models/response/responseCodes";

import ITokenPayload from "../../models/jwt/tokenPayloadInterface";

export default function verifyRequestAuthenticated(req: Request, res: Response, next: NextFunction) {
    try {
        const payload = verify(retrieveTokenFromHeader(req), req.app.get("config").authSecret);
        req.id = (payload as ITokenPayload).id;
        next();
    } catch (err) {
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        next(err);
    }

}

function retrieveTokenFromHeader(req: Request): string {
    if (req.headers.authorization) {
        const authorizationHeader = req.headers.authorization.split(" ");
        if (authorizationHeader[0] === "Bearer") {
            return authorizationHeader[1];
        }
    }
    return '';
}
