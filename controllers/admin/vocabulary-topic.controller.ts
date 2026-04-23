import { Request, Response } from "express";
import VocabularyTopic from "../../models/vocabulary-topic.model";

// [GET] /admin/vocabulary-topic
export const index = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const find: any = {
            userId,
            deleted: req.query.is_trash === "true" ? true : false
        };

        // Tìm kiếm
        const keyword = req.query.keyword || req.query.q;
        if (keyword) {
            const regex = new RegExp(`${keyword}`, "i");
            find.$or = [
                { title: regex },
                { description: regex }
            ];
        }

        if (req.query.status) {
            const statusArr = (req.query.status as string).split(',');
            find.status = { $in: statusArr };
        }

        // Phân trang
        const limitItems = parseInt(req.query.limit as string) || 20;
        let page = 1;
        if (req.query.page && parseInt(`${req.query.page}`) > 0) {
            page = parseInt(`${req.query.page}`);
        }

        const [recordList, totalRecords] = await Promise.all([
            VocabularyTopic.find(find)
                .sort({ createdAt: "desc" })
                .limit(limitItems)
                .skip((page - 1) * limitItems)
                .lean(),
            VocabularyTopic.countDocuments(find)
        ]);

        const pagination = {
            totalRecords,
            totalPages: Math.ceil(totalRecords / limitItems),
            currentPage: page,
            limit: limitItems
        };

        res.json({
            success: true,
            code: 200,
            message: "Thành công",
            data: {
                recordList,
                pagination
            },
        });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Lỗi hệ thống" });
    }
};

// [POST] /admin/vocabulary-topic/create
export const create = async (req: Request, res: Response) => {
    try {
        req.body.userId = (req as any).user.id;
        const topic = new VocabularyTopic(req.body);
        await topic.save();

        res.json({
            success: true,
            code: 200,
            message: "Tạo chủ đề thành công",
            data: topic,
        });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Lỗi tạo chủ đề" });
    }
};

// [PATCH] /admin/vocabulary-topic/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await VocabularyTopic.updateOne({ _id: req.params.id, userId }, req.body);
        res.json({ success: true, code: 200, message: "Cập nhật thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Cập nhật thất bại" });
    }
};

// [DELETE] /admin/vocabulary-topic/delete/:id
export const deleteTopic = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await VocabularyTopic.updateOne(
            { _id: req.params.id, userId },
            { deleted: true, deletedAt: new Date() }
        );
        res.json({ success: true, code: 200, message: "Xóa thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Xóa thất bại" });
    }
};

// [PATCH] /admin/vocabulary-topic/restore/:id
export const restore = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await VocabularyTopic.updateOne(
            { _id: req.params.id, userId },
            { deleted: false, $unset: { deletedAt: 1 } }
        );
        res.json({ success: true, code: 200, message: "Khôi phục thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Khôi phục thất bại" });
    }
};

// [DELETE] /admin/vocabulary-topic/force-delete/:id
export const forceDelete = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await VocabularyTopic.deleteOne({ _id: req.params.id, userId });
        res.json({ success: true, code: 200, message: "Xóa vĩnh viễn thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Xóa vĩnh viễn thất bại" });
    }
};
