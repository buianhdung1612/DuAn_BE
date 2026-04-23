import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/personal-vision.controller";

router.get("/", controller.index);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.delete("/delete/:id", controller.deleteVision);

export const personalVisionRoutes: Router = router;
