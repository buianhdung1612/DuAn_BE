import { Request, Response } from "express";
import Book from "../../models/book.model";

// [GET] /admin/book
export const index = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const find: any = {
            userId,
            deleted: false,
        };

        if (req.query.categoryId) {
            find.categoryId = req.query.categoryId;
        }

        if (req.query.status) {
            find.status = req.query.status;
        }

        const books = await Book.find(find)
            .populate("categoryId", "name")
            .sort({ createdAt: -1 });

        res.json({
            code: 200,
            message: "Thành công",
            data: books,
        });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi hệ thống" });
    }
};

// [POST] /admin/book/create
export const create = async (req: Request, res: Response) => {
    try {
        req.body.userId = (req as any).user.id;
        const book = new Book(req.body);
        await book.save();

        res.json({
            code: 200,
            message: "Thành công",
            data: book,
        });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi tạo sách" });
    }
};

// [PATCH] /admin/book/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await Book.updateOne({ _id: req.params.id, userId }, req.body);
        res.json({ code: 200, message: "Cập nhật thành công" });
    } catch (error) {
        res.json({ code: 500, message: "Cập nhật thất bại" });
    }
};

// [DELETE] /admin/book/delete/:id
export const deleteBook = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await Book.updateOne(
            { _id: req.params.id, userId },
            { deleted: true, deletedAt: new Date() }
        );
        res.json({ code: 200, message: "Xóa thành công" });
    } catch (error) {
        res.json({ code: 500, message: "Xóa thất bại" });
    }
};

// [GET] /admin/book/detail/:id
export const detail = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const book = await Book.findOne({ _id: req.params.id, userId, deleted: false })
            .populate("categoryId", "name")
            .populate("blogId", "name")
            .populate("mindMapId", "title");

        res.json({ code: 200, data: book });
    } catch (error) {
        res.json({ code: 500, message: "Không tìm thấy sách" });
    }
};

// [PATCH] /admin/book/log-practice/:id/:practiceId
export const logPractice = async (req: Request, res: Response) => {
    try {
        const { id, practiceId } = req.params;
        const userId = (req as any).user.id;
        const now = new Date();

        const book = await Book.findOne({ _id: id, userId });
        if (!book) return res.json({ code: 404, message: "Không tìm thấy" });

        const practice: any = (book.practices as any).id(practiceId as string);
        if (!practice) return res.json({ code: 404, message: "Không tìm thấy hành động" });

        practice.lastCompletedAt = now;
        practice.completedDates.push(now);

        await book.save();

        res.json({ code: 200, message: "Duyệt thực hành thành công", data: practice });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi hệ thống" });
    }
};
