import { Router } from "express";
import { verifyClient } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  createMemberShip,
  getListOfMemberships,
  getMemberShipById,
  getMemberdetailsbyId,
} from "../controllers/membership.controller.js";

const router = Router();
router.use(verifyClient);

router.route("/create").post(upload.none(), createMemberShip);
router.route("/").get(getListOfMemberships);
router.route("/member/:id").get(getMemberdetailsbyId);
router.route("/:id").get(getMemberShipById);

export default router;
