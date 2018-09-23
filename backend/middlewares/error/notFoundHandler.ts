import {Request, Response, NextFunction} from "express";

import {ResponseCodes} from "../../models/response/responseCodes";

function handleNotFound(req: Request, res: Response, next: NextFunction) {
    const err = new Error("Not Found");
    res.status(ResponseCodes.ERROR_NOT_FOUND);
    req.routed = true;
    next(err);
}

export default handleNotFound;
