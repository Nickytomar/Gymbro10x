import { Router } from "express";
import { verifyClient } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createMember,
  getListOfMembers,
  getMemberById,
  getListOfInactiveMembers,
  deleteMemberById,
  getListOfMembersbyClientId,
} from "../controllers/member.controller.js";

const router = Router();
router.use(verifyClient);

router.route("/add").post(upload.none(), createMember);
router.route("/").get(getListOfMembers);
router.route("/inactive").get(getListOfInactiveMembers);
router.route("/client/:id").get(getListOfMembersbyClientId);
router.route("/:id").get(getMemberById).delete(deleteMemberById);

export default router;
