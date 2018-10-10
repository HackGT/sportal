import {Router} from "express";

import search from "./participant/search";
import tag from "./participant/tag";
import untag from "./participant/untag";
import all from "./participant/all";
import confirm from "./participant/confirm";

import requireAuth from "../middlewares/auth/verify";

const router = Router();

router.use("/search", requireAuth, search);
router.use("/tag", requireAuth, tag);
router.use("/untag", requireAuth, untag);
router.use("/all", requireAuth, all);
router.use("/confirm", confirm);

export default router;
