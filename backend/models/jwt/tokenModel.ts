import {sign, SignOptions} from "jsonwebtoken";

import TokenPayloadInterface from "./tokenPayloadInterface";

export class ReturnTokenPayload implements TokenPayloadInterface {
    id: string;

    constructor(id: string) {
        this.id = id;
    }
}

export function createToken(id: string, secret: string, exp: number) {
    const tokenPayload = new ReturnTokenPayload(id);
    return sign(JSON.parse(JSON.stringify(tokenPayload)), secret, <SignOptions> {expiresIn: exp});
}
