import {Router} from "express";

import resume from "./participant/resume";
import search from "./participant/search";

const router = Router();

router.use("/resume", resume);
router.use("/search", search);

export default router;
