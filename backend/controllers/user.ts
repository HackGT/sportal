import {Router, Request, Response, NextFunction} from "express";

import {addUser} from "../models/user/userModel"
import ResponseCodes from "../models/response/responseCodes";
import JSONResponse from "../models/response/jsonGenericResponseModel"

import renew from "./user/renew";
import login from "./user/login";
import requireAuth from "../middlewares/auth/verify"

interface AddUserRequest {
    email: string;
    password: string;
    orgId: number;
    apiKey: string;
}

const router = Router();

router.use('/renew', requireAuth, renew);
router.use('/login', login);

router.put('', function(req: Request, res: Response, next: NextFunction) {
    const addUserRequest = <AddUserRequest> req.body;
    if (addUserRequest.apiKey === req.app.get('config').serverAdminApiKey) {
        addUser(addUserRequest.email, addUserRequest.password, addUserRequest.orgId).then(function() {
            const jsonRes = new JSONResponse(ResponseCodes.SUCCESS, 'success');
            res.status(ResponseCodes.SUCCESS);
            res.json(jsonRes);
        }).catch(function(err) {
            res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
            next(err);
        });
    } else {
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        next(new Error('Unauthorized'));
    }
});

export default router;