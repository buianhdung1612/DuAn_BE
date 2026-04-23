import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/productivity.controller";

router.get("/plan", controller.getPlan);
router.post("/create", controller.create);
router.patch("/update-execution", controller.updateExecution);
router.patch("/update-weekly-planning", controller.updateWeeklyPlanning);
router.patch("/update-time-blocks", controller.updateTimeBlocks);
router.patch("/edit/:id", controller.edit);

export const productivityRoutes: Router = router;
