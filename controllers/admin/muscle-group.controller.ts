import { Request, Response } from 'express';
import MuscleGroup from '../../models/muscle-group.model';

export const index = async (req: Request, res: Response) => {
    try {
        const data = await MuscleGroup.find().sort({ createdAt: -1 });
        res.json({ code: 200, data });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Internal server error" });
    }
};

export const create = async (req: Request, res: Response) => {
    try {
        const item = new MuscleGroup(req.body);
        await item.save();
        res.json({ code: 200, message: "Đã tạo nhóm cơ!", data: item });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Bad request" });
    }
};

export const edit = async (req: Request, res: Response) => {
    try {
        const item = await MuscleGroup.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ code: 200, message: "Đã cập nhật nhóm cơ!", data: item });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Bad request" });
    }
};

export const deleteItem = async (req: Request, res: Response) => {
    try {
        await MuscleGroup.findByIdAndDelete(req.params.id);
        res.json({ code: 200, message: "Đã xóa nhóm cơ" });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Bad request" });
    }
};
