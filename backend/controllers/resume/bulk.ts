import {Router} from "express";

import prepare from "./bulk/prepare";
import status from "./bulk/status";
import download from "./bulk/download";

import requireAuth from "../../middlewares/auth/verify";

export const router = Router();

router.use("/prepare", requireAuth, prepare);
router.use("/status", requireAuth, status);
router.use("/download", download);

export default router;
