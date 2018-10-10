import {Router} from "express";

import {addUser} from "../models/user/userModel";
import {ResponseCodes} from "../models/util/response/responseCodes";

import renew from "./user/renew";
import login from "./user/login";
import requireAuth from "../middlewares/auth/verify";

interface IAddUserRequest {
    email: string;
    password: string;
    apiKey: string;
    sponsorName: string
}

const router = Router();

router.use("/renew", requireAuth, renew);
router.use("/login", login);

router.put('/', async (req, res, next) => {
    const addUserRequest = req.body as IAddUserRequest;
    if (!addUserRequest || !addUserRequest.email || !addUserRequest.password || !addUserRequest.apiKey || !addUserRequest.sponsorName) {
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        req.routed = true;
        next(new Error("Request missing user add parameters"));
    }
    if (addUserRequest.apiKey === req.app.get("config").serverAdminApiKey) {
        try {
            await addUser(req.app.get("dbConnection"), addUserRequest.email, addUserRequest.password, addUserRequest.sponsorName);
            res.status(ResponseCodes.SUCCESS);
            req.routed = true;
            next();
        }
        catch(err) {
            res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
            req.routed = true;
            next(err);
        }
    } else {
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        req.routed = true;
        next(new Error("Unauthorized"));
    }
});

export default router;
