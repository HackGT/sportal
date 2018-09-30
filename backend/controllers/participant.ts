import {Router} from "express";

import resume from "./participant/resume";
import search from "./participant/search";
import tag from "./participant/tag";
import untag from "./participant/untag";
import all from "./participant/all";

const router = Router();

router.use("/resume", resume);
router.use("/search", search);
router.use("/tag", tag);
router.use("/untag", untag);
router.use("/all", all);

export default router;
