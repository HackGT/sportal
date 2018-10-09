import {Router} from "express";

import search from "./participant/search";
import tag from "./participant/tag";
import untag from "./participant/untag";
import all from "./participant/all";
import confirm from "./participant/confirm";

const router = Router();

router.use("/search", search);
router.use("/tag", tag);
router.use("/untag", untag);
router.use("/all", all);
router.use("/confirm", confirm);

export default router;
