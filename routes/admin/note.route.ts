import { Router } from "express";
const router: Router = Router();

import * as controller from "../../controllers/admin/note.controller";

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.delete("/delete/:id", controller.deleteNote);

export const noteRoutes: Router = router;
