import { Request, Response } from "express";
import Note from "../../models/note.model";

// [GET] /admin/notes
export const index = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const find: any = {
            userId,
            deleted: false
        };

        if (req.query.keyword) {
            const regex = new RegExp(`${req.query.keyword}`, "i");
            find.$or = [
                { title: regex },
                { topic: regex }
            ];
        }

        if (req.query.topic) {
            find.topic = req.query.topic;
        }

        const notes = await Note.find(find).sort({ updatedAt: -1 });

        res.json({
            success: true,
            code: 200,
            message: "Thành công",
            data: notes
        });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Lỗi hệ thống" });
    }
};

// [GET] /admin/notes/detail/:id
export const detail = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const note = await Note.findOne({ _id: req.params.id, userId, deleted: false });

        if (!note) {
            return res.json({ success: false, code: 404, message: "Không tìm thấy ghi chú" });
        }

        res.json({
            success: true,
            code: 200,
            data: note
        });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Lỗi hệ thống" });
    }
};

// [POST] /admin/notes/create
export const create = async (req: Request, res: Response) => {
    try {
        req.body.userId = (req as any).user.id;
        const note = new Note(req.body);
        await note.save();

        res.json({
            success: true,
            code: 200,
            message: "Tạo ghi chú thành công",
            data: note
        });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Lỗi tạo ghi chú" });
    }
};

// [PATCH] /admin/notes/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await Note.updateOne({ _id: req.params.id, userId }, req.body);
        res.json({ success: true, code: 200, message: "Cập nhật thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Cập nhật thất bại" });
    }
};

// [DELETE] /admin/notes/delete/:id
export const deleteNote = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await Note.updateOne(
            { _id: req.params.id, userId },
            { deleted: true, deletedAt: new Date() }
        );
        res.json({ success: true, code: 200, message: "Xóa thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Xóa thất bại" });
    }
};
