import { Router } from "express";
import { verifyClient } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { createMember } from "../controllers/member.controller.js";

const router = Router();
router.use(verifyClient);

router.route("/add").post(upload.none(), createMember);

export default router;
