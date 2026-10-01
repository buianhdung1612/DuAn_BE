import express from "express";
const router = express.Router();
import * as controller from "../../controllers/client/doc.controller";

router.get("/categories", controller.getCategories);
router.get("/categories/:categorySlug", controller.getArticlesByCategory);
router.get("/articles/:articleSlug", controller.getArticleDetail);

export const docRoutes = router;
