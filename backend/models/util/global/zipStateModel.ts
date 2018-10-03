export enum ZipStatus {
    PREPARING = "PREPARING",
    READY = "READY",
    FAILED = "FAILED"
}

export class ZipState {
    status: ZipStatus
    expires: Date
    creator: string
    authToken: string

    constructor(status: ZipStatus, expires: Date, creator: string, authToken: string) {
        this.status = status;
        this.expires = expires;
        this.creator = creator;
        this.authToken = authToken;
    }
}