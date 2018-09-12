import {Request, Response, NextFunction} from "express";
import {Logger} from "log4js";

import JSONResponse from "../../models/response/jsonGenericResponseModel";
import ResponseCodes from "../../models/response/responseCodes";

function handleFinalError(err: Error, req: Request, res: Response, next: NextFunction) {

    if (!res.statusCode) {
        res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
    }
    let errorResponse;
    if (req.app.get("config").serverEnv === "development") {
        errorResponse = new JSONResponse(res.statusCode, err.message);
    } else {
        errorResponse = new JSONResponse(res.statusCode, res.statusMessage);
    }
    const logger: Logger = req.app.get("logger");
    if (res.statusCode < 500) {
        logger.warn(req.method + " " + req.originalUrl + ": " + err.message);
    } else {
        logger.error(req.method + " " + req.originalUrl + ": " + err.message);
        logger.error(err);
    }
    res.json(errorResponse);
}

export default handleFinalError;
