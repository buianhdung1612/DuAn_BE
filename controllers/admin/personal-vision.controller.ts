import { Request, Response } from "express";
import PersonalVision from "../../models/personal-vision.model";

// [GET] /admin/personal-vision
export const index = async (req: Request, res: Response) => {
    try {
        const visions = await PersonalVision.find({
            userId: (req as any).user.id,
            deleted: false,
        }).sort({ createdAt: -1 });

        res.json({
            code: 200,
            message: "Thành công",
            data: visions,
        });
    } catch (error) {
        res.json({
            code: 500,
            message: "Lỗi hệ thống",
        });
    }
};

// [POST] /admin/personal-vision/create
export const create = async (req: Request, res: Response) => {
    try {
        req.body.userId = (req as any).user.id;
        const vision = new PersonalVision(req.body);
        await vision.save();

        res.json({
            code: 200,
            message: "Tạo tầm nhìn thành công",
            data: vision,
        });
    } catch (error) {
        res.json({
            code: 500,
            message: "Tạo thất bại",
        });
    }
};

// [DELETE] /admin/personal-vision/delete/:id
export const deleteVision = async (req: Request, res: Response) => {
    try {
        await PersonalVision.updateOne(
            { _id: req.params.id, userId: (req as any).user.id },
            { deleted: true, deletedAt: new Date() }
        );
        res.json({
            code: 200,
            message: "Xóa thành công",
        });
    } catch (error) {
        res.json({
            code: 500,
            message: "Xóa thất bại",
        });
    }
};
// [PATCH] /admin/personal-vision/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        await PersonalVision.updateOne(
            { _id: req.params.id, userId: (req as any).user.id },
            req.body
        );

        res.json({
            code: 200,
            message: "Cập nhật thành công",
        });
    } catch (error) {
        res.json({
            code: 500,
            message: "Cập nhật thất bại",
        });
    }
};
