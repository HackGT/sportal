import {sign, SignOptions} from "jsonwebtoken";

import ITokenPayload from "./tokenPayloadInterface";

export class ReturnTokenPayload implements ITokenPayload {
    public id: string;
    public sponsor: string;

    constructor(id: string, sponsor: string) {
        this.id = id;
        this.sponsor = sponsor;
    }
}

export function createToken(id: string, sponsor: string, secret: string, exp: number) {
    const tokenPayload = new ReturnTokenPayload(id, sponsor);
    return sign(JSON.parse(JSON.stringify(tokenPayload)), secret, {expiresIn: exp} as SignOptions);
}
