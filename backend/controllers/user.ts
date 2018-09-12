import {Router} from "express";

import {addUser} from "../models/user/userModel";
import ResponseCodes from "../models/response/responseCodes";

import renew from "./user/renew";
import login from "./user/login";
import requireAuth from "../middlewares/auth/verify";

interface IAddUserRequest {
    email: string;
    password: string;
    orgId: number;
    apiKey: string;
}

const router = Router();

router.use("/renew", requireAuth, renew);
router.use("/login", login);

router.put('/', async (req, res, next) => {
    const addUserRequest = req.body as IAddUserRequest;
    if (addUserRequest.apiKey === req.app.get("config").serverAdminApiKey) {
        try {
            await addUser(addUserRequest.email, addUserRequest.password, addUserRequest.orgId);
            res.status(ResponseCodes.SUCCESS);
            next();
        }
        catch(err) {
            res.status(ResponseCodes.ERROR_INTERNAL_SERVER_ERROR);
            next(err);
        }
    } else {
        res.status(ResponseCodes.ERROR_UNAUTHORIZED);
        next(new Error("Unauthorized"));
    }
});

export default router;
