import { Router } from "express";
import { verifyClient } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  createMembershipDropDown,
  getAllMembershipDropDown,
  getSingleMembershipDropDown,
  deleteMembershipDropDown,
} from "../controllers/membershipDropDown.controller.js";

const router = Router();
router.use(verifyClient);

router.route("/create").post(upload.none(), createMembershipDropDown);
router.route("/").get(getAllMembershipDropDown);
router.route("/:id").get(getSingleMembershipDropDown);
router.route("/delete/:id").delete(deleteMembershipDropDown);

export default router;
