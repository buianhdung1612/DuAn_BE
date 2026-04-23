import express from "express";
const router = express.Router();
import * as controller from "../../controllers/admin/mind-map.controller";

router.get("/", controller.index);
router.post("/create", controller.create);
router.patch("/edit/:id", controller.edit);
router.get("/detail/:id", controller.detail);

export const mindMapRoutes = router;
