export enum ZipStatus {
    PREPARING = "PREPARING",
    READY = "READY",
    FAILED = "FAILED",
    EXPIRED = "EXPIRED"
}

export class ZipState {
    status: ZipStatus
    expires: number
    creators: Set<string>
    resumeUrl: string

    constructor(status: ZipStatus, expires: number, creators: Set<string>) {
        this.status = status;
        this.expires = expires;
        this.creators = creators;
    }
}