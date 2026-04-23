import express from "express";
const router = express.Router();
import * as controller from "../../controllers/admin/daily-summary.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

router.get("/today-content", authMiddleware.verifyToken, controller.getTodayContent);
router.get("/getByDate", authMiddleware.verifyToken, controller.getByDate);
router.post("/upsert", authMiddleware.verifyToken, controller.upsert);

export const dailySummaryRoutes = router;
