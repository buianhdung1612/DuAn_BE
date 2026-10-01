import { Request, Response } from "express";
import Task from "../../models/task.model";
import TwelveWeekYear from "../../models/twelve-week-year.model";
import dayjs from "dayjs";

// [GET] /api/v1/admin/tasks
export const index = async (req: Request, res: Response) => {
    try {
        const tasks = await Task.find({ deleted: false })
            .populate('categoryId', 'name color')
            .populate('parentId', 'title')
            .sort({ start: 1 });

        res.json({
            code: 200,
            tasks: tasks
        });
    } catch (error) {
        res.json({ code: 400, message: "Lỗi!" });
    }
};

// [POST] /api/v1/admin/tasks/create
export const create = async (req: Request, res: Response) => {
    try {
        const data = { ...req.body };
        if (data.tacticId === "") data.tacticId = null;
        if (data.categoryId === "") data.categoryId = null;
        if (data.parentId === "") data.parentId = null;

        const task = new Task(data);
        await task.save();

        res.json({
            code: 200,
            message: "Tạo nhiệm vụ thành công!",
            task: task
        });
    } catch (error) {
        res.json({ code: 400, message: "Lỗi tạo nhiệm vụ!" });
    }
};

// [PATCH] /api/v1/admin/tasks/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const data = { ...req.body };

        if (data.tacticId === "") data.tacticId = null;
        if (data.categoryId === "") data.categoryId = null;
        if (data.parentId === "") data.parentId = null;

        await Task.updateOne({ _id: id }, data);

        // Logic sync with 12-week year
        if (data.isCompleted !== undefined) {
            const task = await Task.findById(id);
            if (task && task.tacticId && task.start) {
                const plan = await TwelveWeekYear.findOne({
                    'tactics._id': task.tacticId,
                    status: 'active'
                });

                if (plan) {
                    const startDate = dayjs(plan.startDate);
                    const taskDate = dayjs(task.start);
                    const weekIndex = Math.floor(taskDate.diff(startDate, 'day') / 7);

                    if (weekIndex >= 0 && weekIndex < 13) {
                        const executionKey = `weeklyExecution.${weekIndex}.actualScore`;
                        // Cập nhật điểm dựa trên trạng thái mới
                        await TwelveWeekYear.updateOne(
                            { _id: plan._id },
                            { $inc: { [executionKey]: data.isCompleted ? 1 : -1 } }
                        );
                    }
                }
            }
        }

        res.json({
            code: 200,
            message: "Cập nhật thành công!"
        });
    } catch (error) {
        res.json({ code: 400, message: "Lỗi cập nhật!" });
    }
};

// [DELETE] /api/v1/admin/tasks/delete/:id
export const deleteTask = async (req: Request, res: Response) => {
    try {
        await Task.updateOne({ _id: req.params.id }, {
            deleted: true,
            deletedAt: new Date()
        });
        res.json({ code: 200, message: "Xóa thành công!" });
    } catch (error) {
        res.json({ code: 400, message: "Lỗi xóa!" });
    }
};
