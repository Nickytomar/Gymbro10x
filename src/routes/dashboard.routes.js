import { Router } from "express";
import { verifyClient } from "../middlewares/auth.middleware.js";
import { dashboard } from "../controllers/dashboard.controller.js";

const router = Router();
router.use(verifyClient);

router.route("/").get(dashboard);

export default router;
