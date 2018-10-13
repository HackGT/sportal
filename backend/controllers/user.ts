import {Router} from "express";

import {IUser, getUserProfile, addUser} from "../models/user/userModel";
import {ResponseCodes} from "../models/util/response/responseCodes";
import {isEmail} from "../util/validation/validation";

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
        return;
    }
    if (!isEmail(addUserRequest.email)) {
        res.status(ResponseCodes.ERROR_BAD_REQUEST);
        req.routed = true;
        next(new Error("Email is not a valid format"));
        return;
    }
    if (addUserRequest.apiKey === req.app.get("config").serverAdminApiKey) {
        try {
            const email = addUserRequest.email.toLowerCase();
            let profile: IUser;
            profile = await getUserProfile(req.app.get("dbConnection"), email);
            if (profile) {
                res.status(ResponseCodes.ERROR_UNPROCESSABLE_ENTITY);
                req.routed = true;
                next(new Error("Email already exists!"));
                return;
            }
            await addUser(req.app.get("dbConnection"), email, addUserRequest.password, addUserRequest.sponsorName);
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
