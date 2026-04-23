import { Router } from "express";
import * as controller from "../../controllers/admin/book.controller";

const router = Router();

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.delete("/delete/:id", controller.deleteBook);
router.patch("/log-practice/:id/:practiceId", controller.logPractice);

export default router;
