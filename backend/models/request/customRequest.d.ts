declare namespace Express {
    export interface Request {
        id?: string;
        returnObject?: object;
        routed?: boolean
    }
}