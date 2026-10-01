import { Router } from "express";
import articleRoutes from "./article.route";
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
import categoryCalendarRoutes from "./category-calendar.route";
import calendarEventRoutes from "./calendar-event.route";
import { taskRoutes } from "./task.route";
import { workoutRoutes } from "./workout.route";
import { nutritionRoutes } from "./nutrition.route";
import { financeRoutes } from "./finance.route";
import { docRoutes } from "./doc.route";
import { writingRoutes } from "./writing.route";

import * as authMiddleware from "../../middlewares/admin/auth.middleware";

const router = Router();

// Routes without authentication
router.use('/auth', authRoutes);

// Protected routes
router.use('/article', authMiddleware.verifyToken, articleRoutes);
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
router.use('/category-calendar', authMiddleware.verifyToken, categoryCalendarRoutes);
router.use('/calendar-events', authMiddleware.verifyToken, calendarEventRoutes);
router.use('/tasks', authMiddleware.verifyToken, taskRoutes);
router.use('/workouts', authMiddleware.verifyToken, workoutRoutes);
router.use('/nutrition', authMiddleware.verifyToken, nutritionRoutes);
router.use('/finance', authMiddleware.verifyToken, financeRoutes);
router.use('/docs', authMiddleware.verifyToken, docRoutes);
import { exerciseRoutes } from "./exercise.route";
import { muscleGroupRoutes } from "./muscle-group.route";

router.use('/writing', authMiddleware.verifyToken, writingRoutes);
router.use('/exercises', authMiddleware.verifyToken, exerciseRoutes);
router.use('/muscle-groups', authMiddleware.verifyToken, muscleGroupRoutes);

export default router;
