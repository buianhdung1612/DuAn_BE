import { Request, Response } from "express";
import CalendarEvent from "../../models/calendar-event.model";

// [GET] /admin/calendar-event
export const index = async (req: Request, res: Response) => {
    try {
        const find: any = {
            deleted: false
        };

        const recordList = await CalendarEvent.find(find)
            .sort({ start: "asc" })
            .populate("categoryId")
            .lean();

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

// [POST] /admin/calendar-event/create
export const create = async (req: Request, res: Response) => {
    try {
        if (req.body.categoryId === '') {
            delete req.body.categoryId;
        }

        const event = new CalendarEvent(req.body);
        await event.save();

        res.json({
            success: true,
            code: 200,
            message: "Tạo sự kiện thành công",
            data: event,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, code: 500, message: "Lỗi tạo sự kiện" });
    }
};

// [PATCH] /admin/calendar-event/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        if (req.body.categoryId === '') {
            req.body.categoryId = null;
        }

        await CalendarEvent.updateOne({ _id: req.params.id }, req.body);

        res.json({ success: true, code: 200, message: "Cập nhật sự kiện thành công" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, code: 500, message: "Cập nhật thất bại" });
    }
};

// [DELETE] /admin/calendar-event/delete/:id
export const deleteEvent = async (req: Request, res: Response) => {
    try {
        await CalendarEvent.deleteOne({ _id: req.params.id });
        res.json({ success: true, code: 200, message: "Xóa sự kiện thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Xóa thất bại" });
    }
};
