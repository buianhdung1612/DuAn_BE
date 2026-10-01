import { Request, Response } from "express";
import CategoryCalendar from "../../models/category-calendar.model";

// [GET] /admin/category-calendar
export const index = async (req: Request, res: Response) => {
    try {
        const find: any = {
            deleted: false
        };

        const recordList = await CategoryCalendar.find(find).sort({ createdAt: "desc" }).lean();

        res.json({
            success: true,
            code: 200,
            message: "Thành công",
            data: recordList,
        });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Lỗi hệ thống" });
    }
};

// [POST] /admin/category-calendar/create
export const create = async (req: Request, res: Response) => {
    try {
        const category = new CategoryCalendar(req.body);
        await category.save();

        res.json({
            success: true,
            code: 200,
            message: "Tạo chủ đề thành công",
            data: category,
        });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Lỗi tạo chủ đề" });
    }
};

// [PATCH] /admin/category-calendar/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        await CategoryCalendar.updateOne({ _id: req.params.id }, req.body);
        res.json({ success: true, code: 200, message: "Cập nhật thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Cập nhật thất bại" });
    }
};

// [DELETE] /admin/category-calendar/delete/:id
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        await CategoryCalendar.updateOne(
            { _id: req.params.id },
            { deleted: true, deletedAt: new Date() }
        );
        res.json({ success: true, code: 200, message: "Xóa thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Xóa thất bại" });
    }
};
