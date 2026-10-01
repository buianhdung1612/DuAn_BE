import { Request, Response } from "express";
import Notification from "../../models/notification.model";
import Task from "../../models/task.model";
import Vocabulary from "../../models/vocabulary.model";
import mongoose from "mongoose";

// [GET] /api/v1/admin/notifications
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        
        if (userId) {
            const now = new Date();

            // 1. Quét và tạo thông báo nhiệm vụ QUÁ HẠN
            const overdueTasks = await Task.find({
                deleted: false,
                isCompleted: false,
                end: { $lt: now }
            });

            for (const task of overdueTasks) {
                const exists = await Notification.exists({
                    type: "overrun",
                    "metadata.taskId": task._id
                });
                if (!exists) {
                    await Notification.create({
                        title: "⚠️ Nhiệm vụ quá hạn!",
                        content: `Nhiệm vụ "${task.title}" đã quá hạn chót vào lúc ${new Date(task.end!).toLocaleDateString('vi-VN')}!`,
                        type: "overrun",
                        link: "/admin/productivity",
                        receiverId: new mongoose.Types.ObjectId(userId),
                        metadata: { taskId: task._id }
                    });
                }
            }

            // 2. Quét và tạo thông báo nhiệm vụ SẮP HẾT HẠN (trong vòng 24 giờ)
            const dueSoonTasks = await Task.find({
                deleted: false,
                isCompleted: false,
                end: { $gte: now, $lte: new Date(now.getTime() + 24 * 60 * 60 * 1000) }
            });

            for (const task of dueSoonTasks) {
                const exists = await Notification.exists({
                    type: "delayed",
                    "metadata.taskId": task._id
                });
                if (!exists) {
                    const hoursRemaining = Math.max(1, Math.round((new Date(task.end!).getTime() - now.getTime()) / (3600 * 1000)));
                    await Notification.create({
                        title: "⏳ Nhiệm vụ sắp hết hạn!",
                        content: `Nhiệm vụ "${task.title}" chỉ còn khoảng ${hoursRemaining} tiếng nữa là hết hạn!`,
                        type: "delayed",
                        link: "/admin/productivity",
                        receiverId: new mongoose.Types.ObjectId(userId),
                        metadata: { taskId: task._id }
                    });
                }
            }

            // 3. Quét số lượng từ vựng cần học hôm nay
            const dueVocabsCount = await Vocabulary.countDocuments({
                userId: new mongoose.Types.ObjectId(userId),
                deleted: false,
                nextReview: { $lte: now }
            });

            if (dueVocabsCount > 0) {
                const startOfDay = new Date();
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date();
                endOfDay.setHours(23, 59, 59, 999);

                const existingReminder = await Notification.findOne({
                    receiverId: new mongoose.Types.ObjectId(userId),
                    type: "system",
                    "metadata.type": "vocab_reminder",
                    createdAt: { $gte: startOfDay, $lte: endOfDay }
                });

                if (existingReminder) {
                    await Notification.updateOne(
                        { _id: existingReminder._id },
                        { content: `Bạn đang có ${dueVocabsCount} từ vựng cần ôn tập hôm nay. Bấm vào để bắt đầu học ngay!` }
                    );
                } else {
                    await Notification.create({
                        title: "🇬🇧 Ôn tập từ vựng hôm nay",
                        content: `Bạn đang có ${dueVocabsCount} từ vựng cần ôn tập hôm nay. Bấm vào để bắt đầu học ngay!`,
                        type: "system",
                        link: "/admin/vocabulary/study",
                        receiverId: new mongoose.Types.ObjectId(userId),
                        metadata: { type: "vocab_reminder" }
                    });
                }
            }
        }

        const { status } = req.query;
        let query: any = { isDeleted: false };
        if (userId) {
            query.receiverId = new mongoose.Types.ObjectId(userId);
        }

        if (status) {
            query.status = status;
        }

        const notifications = await Notification.find(query)
            .populate("senderId", "fullName avatar")
            .sort({ createdAt: -1 })
            .limit(100);

        res.json({
            code: 200,
            data: notifications
        });
    } catch (error) {
        console.error("getNotifications error:", error);
        res.status(500).json({
            code: 500,
            message: "Lỗi khi lấy thông báo"
        });
    }
};

// [PATCH] /api/v1/admin/notifications/mark-read/all
export const markAllAsRead = async (req: Request, res: Response) => {
    try {
        await Notification.updateMany({ isDeleted: false, status: 'unread' }, { status: 'read' });
        res.json({
            code: 200,
            message: "Đã đánh dấu tất cả là đã đọc"
        });
    } catch (error) {
        console.error("markAllAsRead error:", error);
        res.status(500).json({
            code: 500,
            message: "Lỗi khi đánh dấu đã đọc"
        });
    }
};

// [PATCH] /api/v1/admin/notifications/mark-read/:id
export const markAsRead = async (req: Request, res: Response) => {
    try {
        await Notification.updateOne({ _id: req.params.id }, { status: 'read' });
        res.json({
            code: 200,
            message: "Đã đọc"
        });
    } catch (error) {
        console.error("markAsRead error:", error);
        res.status(500).json({
            code: 500,
            message: "Lỗi khi đánh dấu đã đọc"
        });
    }
};

// [PATCH] /api/v1/admin/notifications/archive/:id
export const archiveNotification = async (req: Request, res: Response) => {
    try {
        await Notification.updateOne({ _id: req.params.id }, { status: 'archived' });
        res.json({
            code: 200,
            message: "Đã lưu trữ thông báo"
        });
    } catch (error) {
        console.error("archiveNotification error:", error);
        res.status(500).json({
            code: 500,
            message: "Lỗi khi lưu trữ thông báo"
        });
    }
};

// [PATCH] /api/v1/admin/notifications/archive/all
export const archiveAllNotifications = async (req: Request, res: Response) => {
    try {
        await Notification.updateMany({ isDeleted: false, status: { $ne: 'archived' } }, { status: 'archived' });
        res.json({
            code: 200,
            message: "Đã lưu trữ tất cả thông báo"
        });
    } catch (error) {
        console.error("archiveAllNotifications error:", error);
        res.status(500).json({
            code: 500,
            message: "Lỗi khi lưu trữ tất cả thông báo"
        });
    }
};

// [DELETE] /api/v1/admin/notifications/all
export const deleteAllNotifications = async (req: Request, res: Response) => {
    try {
        await Notification.updateMany({ isDeleted: false }, { isDeleted: true });
        res.json({
            code: 200,
            message: "Xóa tất cả thông báo thành công"
        });
    } catch (error) {
        console.error("deleteAllNotifications error:", error);
        res.status(500).json({
            code: 500,
            message: "Lỗi khi xóa tất cả thông báo"
        });
    }
};

// [DELETE] /api/v1/admin/notifications/:id
export const deleteNotification = async (req: Request, res: Response) => {
    try {
        await Notification.updateOne({ _id: req.params.id }, { isDeleted: true });
        res.json({
            code: 200,
            message: "Xóa thông báo thành công"
        });
    } catch (error) {
        console.error("deleteNotification error:", error);
        res.status(500).json({
            code: 500,
            message: "Lỗi khi xóa thông báo"
        });
    }
};
