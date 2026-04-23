import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/vocabulary-topic.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

router.get("/", authMiddleware.verifyToken, controller.index);
router.post("/create", authMiddleware.verifyToken, controller.create);
router.patch("/edit/:id", authMiddleware.verifyToken, controller.edit);
router.patch("/delete/:id", authMiddleware.verifyToken, controller.deleteTopic);
router.patch("/restore/:id", authMiddleware.verifyToken, controller.restore);
router.delete("/force-delete/:id", authMiddleware.verifyToken, controller.forceDelete);

export const vocabularyTopicRoutes: Router = router;
