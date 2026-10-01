import express from "express";
const router = express.Router();
import * as controller from "../../controllers/admin/doc.controller";

router.get("/categories", controller.getCategories);
router.post("/categories", controller.createCategory);
router.patch("/categories/:id", controller.updateCategory);
router.delete("/categories/:id", controller.deleteCategory);

router.get("/articles", controller.getArticles);
router.get("/articles/:id", controller.getArticleDetail);
router.post("/articles", controller.createArticle);
router.patch("/articles/:id", controller.updateArticle);
router.delete("/articles/:id", controller.deleteArticle);

export const docRoutes = router;
