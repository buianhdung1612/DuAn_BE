import { Request, Response } from "express";
import TwelveWeekYear from "../../models/twelve-week-year.model";

// [GET] /admin/productivity/plan
export const getPlan = async (req: Request, res: Response) => {
    try {
        const plan = await TwelveWeekYear.findOne({
            userId: (req as any).user.id,
            deleted: false,
            status: "active"
        }).sort({ createdAt: -1 });

        res.json({
            code: 200,
            message: "Thành công",
            data: plan,
        });
    } catch (error) {
        res.json({
            code: 500,
            message: "Lỗi hệ thống",
        });
    }
};

// [POST] /admin/productivity/create
export const create = async (req: Request, res: Response) => {
    try {
        const { title, startDate, endDate, goals } = req.body;
        
        const weeklyExecution = [];
        for (let i = 1; i <= 13; i++) {
            weeklyExecution.push({
                weekIndex: i,
                executions: [],
                score: 0
            });
        }
        
        const plan = new TwelveWeekYear({
            userId: (req as any).user.id,
            title,
            startDate,
            endDate,
            goals,
            weeklyExecution
        });
        
        await plan.save();

        res.json({
            code: 200,
            success: true,
            message: "Tạo kế hoạch 12 tuần thành công",
            data: plan,
        });
    } catch (error) {
        res.json({
            code: 500,
            success: false,
            message: "Tạo thất bại",
        });
    }
};

// [PATCH] /admin/productivity/update-execution
export const updateExecution = async (req: Request, res: Response) => {
    try {
        const { planId, weekIndex, tacticId, completedDate, isCompleted } = req.body;
        const userId = (req as any).user.id;

        const plan: any = await TwelveWeekYear.findOne({ _id: planId, userId });
        if (!plan) {
            return res.json({ code: 404, message: "Không tìm thấy kế hoạch" });
        }

        const week = plan.weeklyExecution.find((w: any) => w.weekIndex === weekIndex);
        if (!week) {
            return res.json({ code: 404, message: "Không tìm thấy tuần" });
        }

        let execution = week.executions.find((e: any) => e.tacticId?.toString() === tacticId);
        if (!execution) {
            execution = { tacticId, completedDates: [] as Date[], isCompleted: false };
            week.executions.push(execution);
            // Re-find to get the Mongoose subdocument
            execution = week.executions.find((e: any) => e.tacticId?.toString() === tacticId);
        }

        if (execution && completedDate) {
            const date = new Date(completedDate);
            const index = execution.completedDates.findIndex((d: any) => 
                (d instanceof Date ? d : new Date(d)).toDateString() === date.toDateString()
            );
            
            if (index > -1) {
                execution.completedDates.splice(index, 1);
            } else {
                execution.completedDates.push(date);
            }
        }

        if (execution && typeof isCompleted === "boolean") {
            execution.isCompleted = isCompleted;
        }

        // Gather all tactics across all goals for score calculation
        const allTactics: any[] = [];
        plan.goals.forEach((g: any) => {
            if (g.tactics) {
                allTactics.push(...g.tactics);
            }
        });

        const totalTacticsCount = allTactics.length;
        if (totalTacticsCount > 0) {
            const completedCount = week.executions.filter((e: any) => {
                const tacticDef = allTactics.find((t: any) => t._id?.toString() === e.tacticId?.toString());
                const target = tacticDef?.targetPerWeek || 1;
                return e.isCompleted || (e.completedDates && e.completedDates.length >= target);
            }).length;
            week.score = Math.round((completedCount / totalTacticsCount) * 100);
        }

        await plan.save();

        res.json({
            code: 200,
            message: "Cập nhật thực thi thành công",
            data: plan
        });
    } catch (error) {
        console.error("Update execution error:", error);
        res.json({
            code: 500,
            message: "Cập nhật thất bại",
        });
    }
};

// [PATCH] /admin/productivity/update-weekly-planning
export const updateWeeklyPlanning = async (req: Request, res: Response) => {
    try {
        const { planId, weekIndex, weeklyGoals, dailyFocus } = req.body;
        const userId = (req as any).user.id;
 
        const plan = await TwelveWeekYear.findOne({ _id: planId, userId });
        if (!plan) {
            return res.json({ code: 404, message: "Không tìm thấy kế hoạch" });
        }
 
        const week = plan.weeklyExecution.find((w: any) => w.weekIndex === Number(weekIndex));
        if (week) {
            if (weeklyGoals !== undefined) {
                week.weeklyGoals = weeklyGoals;
            }
            if (dailyFocus !== undefined) {
                // Đảm bảo dailyFocus được gán đúng kiểu Map/Object cho Mongoose
                week.dailyFocus = dailyFocus;
            }
            plan.markModified('weeklyExecution');
            
            await plan.save();

            return res.json({
                code: 200,
                success: true,
                message: "Cập nhật kế hoạch tuần thành công",
                data: plan
            });
        }

        res.json({
            code: 404,
            message: "Không tìm thấy tuần trong kế hoạch"
        });
    } catch (error) {
        res.json({
            code: 500,
            message: "Cập nhật thất bại",
        });
    }
};

// [PATCH] /admin/productivity/update-time-blocks
export const updateTimeBlocks = async (req: Request, res: Response) => {
    try {
        const { planId, timeBlocks } = req.body;
        const userId = (req as any).user.id;

        const plan = await TwelveWeekYear.findOne({ _id: planId, userId });
        if (!plan) {
            return res.json({ code: 404, message: "Không tìm thấy kế hoạch" });
        }

        plan.timeBlocks = timeBlocks;
        await plan.save();

        res.json({
            code: 200,
            success: true,
            message: "Cập nhật khung giờ cố định thành công",
            data: plan
        });
    } catch (error) {
        res.json({
            code: 500,
            message: "Cập nhật thất bại",
        });
    }
};

// [PATCH] /admin/productivity/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const { title, startDate, endDate, goals, timeBlocks } = req.body;
        
        await TwelveWeekYear.updateOne(
            { _id: req.params.id, userId: (req as any).user.id },
            {
                title,
                startDate,
                endDate,
                goals,
                timeBlocks
            }
        );

        res.json({
            code: 200,
            success: true,
            message: "Cập nhật kế hoạch thành công",
        });
    } catch (error) {
        res.json({
            code: 500,
            success: false,
            message: "Cập nhật thất bại",
        });
    }
};
