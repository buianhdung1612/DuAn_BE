import { Router } from "express";
import articleRoutes from "./article.route";
import productRoutes from "./product.route";
import brandRoutes from "./brand.route";
import roleRoutes from "./role.route";
import accountAdminRoutes from "./account-admin.route";
import accountUserRoutes from "./account-user.route";
import settingRoutes from "./setting.route";
import authRoutes from "./auth.route";
import dashboardRoutes from "./dashboard.route";
import notificationRoutes from "./notification.route";
import { personalVisionRoutes } from "./personal-vision.route";
import aiRoutes from "./ai.route";
import { vocabularyRoutes } from "./vocabulary.route";
import { vocabularyTopicRoutes } from "./vocabulary-topic.route";
import { productivityRoutes } from "./productivity.route";
import { mindMapRoutes } from "./mind-map.route";
import { dailySummaryRoutes } from "./daily-summary.route";
import bookRoutes from "./book.route";
import categoryBookRoutes from "./category-book.route";
import categoryMindMapRoutes from "./category-mindmap.route";
import uploadRoutes from "./upload.route";
import { noteRoutes } from "./note.route";

import * as authMiddleware from "../../middlewares/admin/auth.middleware";

const router = Router();

// Routes without authentication
router.use('/auth', authRoutes);

// Protected routes
router.use('/article', authMiddleware.verifyToken, articleRoutes);
router.use('/product', authMiddleware.verifyToken, productRoutes);
router.use('/brand', authMiddleware.verifyToken, brandRoutes);
router.use('/role', authMiddleware.verifyToken, roleRoutes);
router.use('/account-admin', authMiddleware.verifyToken, accountAdminRoutes);
router.use('/account-user', authMiddleware.verifyToken, accountUserRoutes);
router.use('/setting', authMiddleware.verifyToken, settingRoutes);
router.use('/dashboard', authMiddleware.verifyToken, dashboardRoutes);
router.use('/notifications', authMiddleware.verifyToken, notificationRoutes);
router.use('/personal-vision', authMiddleware.verifyToken, personalVisionRoutes);
router.use('/ai', authMiddleware.verifyToken, aiRoutes);
router.use('/vocabulary', authMiddleware.verifyToken, vocabularyRoutes);
router.use('/vocabulary-topic', authMiddleware.verifyToken, vocabularyTopicRoutes);
router.use('/productivity', authMiddleware.verifyToken, productivityRoutes);
router.use('/mind-maps', authMiddleware.verifyToken, mindMapRoutes);
router.use('/daily-summaries', authMiddleware.verifyToken, dailySummaryRoutes);
router.use('/books', authMiddleware.verifyToken, bookRoutes);
router.use('/category-book', authMiddleware.verifyToken, categoryBookRoutes);
router.use('/category-mindmap', authMiddleware.verifyToken, categoryMindMapRoutes);
router.use('/upload', authMiddleware.verifyToken, uploadRoutes);
router.use('/notes', authMiddleware.verifyToken, noteRoutes);

export default router;
