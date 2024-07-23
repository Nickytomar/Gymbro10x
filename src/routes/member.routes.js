import { Router } from "express";
import { verifyClient } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createMember,
  getListOfMembers,
  getMemberById,
  getListOfInactiveMembers,
} from "../controllers/member.controller.js";

const router = Router();
router.use(verifyClient);

router.route("/add").post(upload.none(), createMember);
router.route("/").get(getListOfMembers);
router.route("/inactive").get(getListOfInactiveMembers);
router.route("/:id").get(getMemberById);

export default router;
