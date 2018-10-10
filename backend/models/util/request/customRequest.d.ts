declare namespace Express {
    export interface Request {
        id?: string;
        sponsor?: string;
        returnObject?: object;
        routed?: boolean
    }
}