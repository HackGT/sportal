import {Request, Response, NextFunction} from "express";
import {verify} from "jsonwebtoken";
import {ResponseCodes} from "../../models/util/response/responseCodes";

import ITokenPayload from "../../models/util/jwt/tokenPayloadInterface";

export default function verifyRequestAuthenticatedMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        if (req.method !== "OPTIONS") {
            const payload = verifyJWT(retrieveTokenFromHeader(req), req.app.get("config").authSecret);
            req.id = payload.id;
            req.sponsor = payload.sponsor;
            next(); 
        } else {
            next();
        }
    } catch (err) {
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        req.routed = true;
        next(err);
    }

}

export function verifyJWT(jwt: string, authSecret: string): ITokenPayload {
    const payload = verify(jwt, authSecret);
    return (payload as ITokenPayload);
}

export function retrieveTokenFromHeader(req: Request): string {
    if (req.headers.authorization) {
        const authorizationHeader = req.headers.authorization.split(" ");
        if (authorizationHeader[0] === "Bearer") {
            return authorizationHeader[1];
        }
    }
    return '';
}
