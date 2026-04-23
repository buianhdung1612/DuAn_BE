import { Router } from "express";
import * as controller from "../../controllers/admin/ai.controller";

const router = Router();

router.post("/process", controller.processAI);

export default router;
