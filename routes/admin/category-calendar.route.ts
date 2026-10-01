import { Router } from "express";
import * as controller from "../../controllers/admin/category-calendar.controller";

const router = Router();

router.get("/", controller.index);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.delete("/delete/:id", controller.deleteCategory);

export default router;
