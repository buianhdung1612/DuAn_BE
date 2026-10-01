import { Request, Response } from 'express';
import Exercise from '../../models/exercise.model';

export const index = async (req: Request, res: Response) => {
    try {
        const data = await Exercise.find().populate('muscleGroup').sort({ createdAt: -1 });
        res.json({ code: 200, data });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Internal server error" });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const item = new Exercise(req.body);
        await item.save();
        res.json({ code: 200, message: "Đã tạo bài tập!", data: item });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Bad request" });
    }
};

export const edit = async (req: Request, res: Response) => {
    try {
        const item = await Exercise.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ code: 200, message: "Đã cập nhật bài tập!", data: item });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Bad request" });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        await Exercise.findByIdAndDelete(req.params.id);
        res.json({ code: 200, message: "Đã xóa bài tập" });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Bad request" });
    }
};
