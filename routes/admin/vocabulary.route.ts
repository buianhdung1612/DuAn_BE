import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/vocabulary.controller";
import * as authMiddleware from "../../middlewares/admin/auth.middleware";

router.get("/", authMiddleware.verifyToken, controller.index);
router.post("/create", authMiddleware.verifyToken, controller.create);
router.patch("/edit/:id", authMiddleware.verifyToken, controller.edit);
router.delete("/delete/:id", authMiddleware.verifyToken, controller.deleteVocab);
router.post("/generate-ai", authMiddleware.verifyToken, controller.generateAI);
router.post("/generate-bulk", authMiddleware.verifyToken, controller.createBulkAI);
router.post("/generate-note-ai", authMiddleware.verifyToken, controller.generateNoteAI);
router.post("/review/:id", authMiddleware.verifyToken, controller.review);
router.get("/phrasal-verb-groups", authMiddleware.verifyToken, controller.getPhrasalVerbGroups);
router.get("/statistics", authMiddleware.verifyToken, controller.statistics);

export const vocabularyRoutes: Router = router;
