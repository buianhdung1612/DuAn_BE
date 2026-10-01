import { Request, Response } from 'express';
import Nutrition from '../../models/nutrition.model';

// [GET] /api/v1/admin/nutrition
export const index = async (req: Request, res: Response) => {
    try {
        const { date } = req.query;
        let query = {};
        if (date) {
            const start = new Date(date as string);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date as string);
            end.setHours(23, 59, 59, 999);
            query = { date: { $gte: start, $lte: end } };
        }
        const nutrition = await Nutrition.find(query).sort({ date: -1 });
        res.json({
            code: 200,
            data: nutrition
        });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Internal server error" });
    }
};

// [POST] /api/v1/admin/nutrition/create-or-update
export const save = async (req: Request, res: Response) => {
    try {
        const { date } = req.body;
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);
        const end = new Date(date);
        end.setHours(23, 59, 59, 999);

        const nutrition = await Nutrition.findOneAndUpdate(
            { date: { $gte: start, $lte: end } },
            req.body,
            { upsert: true, new: true }
        );

        res.json({
            code: 200,
            message: "Đã cập nhật dinh dưỡng!",
            data: nutrition
        });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Bad request" });
    }
};
