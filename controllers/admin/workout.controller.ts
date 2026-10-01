import { Request, Response } from 'express';
import Workout from '../../models/workout.model';

// [GET] /api/v1/admin/workouts
export const index = async (req: Request, res: Response) => {
    try {
        const workouts = await Workout.find()
            .populate({
                path: 'exercises.exercise',
                populate: { path: 'muscleGroup' }
            })
            .sort({ date: -1 });
        res.json({
            code: 200,
            data: workouts
        });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Internal server error" });
    }
};

// [POST] /api/v1/admin/workouts/create
export const create = async (req: Request, res: Response) => {
    try {
        const workout = new Workout(req.body);
        await workout.save();
        res.json({
            code: 200,
            message: "Đã lưu buổi tập!",
            data: workout
        });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Bad request" });
    }
};

// [PATCH] /api/v1/admin/workouts/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const workout = await Workout.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({
            code: 200,
            message: "Đã cập nhật buổi tập!",
            data: workout
        });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Bad request" });
    }
};

// [DELETE] /api/v1/admin/workouts/delete/:id
export const deleteWorkout = async (req: Request, res: Response) => {
    try {
        await Workout.findByIdAndDelete(req.params.id);
        res.json({
            code: 200,
            message: "Đã xóa buổi tập"
        });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Bad request" });
    }
};
