import { Router } from "express";
import * as controller from "../../controllers/admin/category-mindmap.controller";

const router = Router();

router.get("/", controller.index);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.patch("/delete/:id", controller.deleteCategory);
router.patch("/restore/:id", controller.restore);
router.delete("/force-delete/:id", controller.forceDelete);

export default router;
