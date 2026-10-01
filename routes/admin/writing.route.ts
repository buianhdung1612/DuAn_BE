import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/writing.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

router.get("/", authMiddleware.verifyToken, controller.index);
router.get("/detail/:id", authMiddleware.verifyToken, controller.detail);
router.post("/create", authMiddleware.verifyToken, controller.create);
router.patch("/edit/:id", authMiddleware.verifyToken, controller.edit);
router.delete("/delete/:id", authMiddleware.verifyToken, controller.deleteWriting);
router.post("/generate-feedback", authMiddleware.verifyToken, controller.generateFeedback);

export const writingRoutes: Router = router;
