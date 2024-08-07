import { Router } from "express";
import { verifyClient } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  loginClient,
  logoutClient,
  registerClient,
  getListOfClient,
  deleteClient,
  sendOtptoMail,
  changePassword,
  checkMemberPhoneExist,
} from "../controllers/auth.controller.js";

const router = Router();

// Dashboard
router.route("/").get(getListOfClient);
router.route("/register").post(upload.none(), registerClient);
router.route("/login").post(loginClient);
router.route("/logout").post(verifyClient, logoutClient);
router.route("/delete/:id").delete(deleteClient);
router.route("/send-otp").post(sendOtptoMail);
router.route("/change-password").post(changePassword);
router.route("/check-member-phone").post(verifyClient, checkMemberPhoneExist);

export default router;
