import {Router} from "express";

import prepare from "./bulk/prepare";
import status from "./bulk/status";

import requireAuth from "../../middlewares/auth/verify";

export const router = Router();

router.use("/prepare", requireAuth, prepare);
router.use("/status", requireAuth, status);

export default router;
