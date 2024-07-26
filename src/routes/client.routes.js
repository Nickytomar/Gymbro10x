import { Router } from "express";
import { verifyClient } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

import {
  loginClient,
  logoutClient,
  registerClient,
  getListOfClient,
} from "../controllers/auth.controller.js";

const router = Router();

// Dashboard
router.route("/").get(getListOfClient);
router.route("/register").post(upload.none(), registerClient);
router.route("/login").post(loginClient);
router.route("/logout").post(verifyClient, logoutClient);

export default router;
