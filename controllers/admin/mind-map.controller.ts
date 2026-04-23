import { Request, Response } from "express";
import MindMap from "../../models/mind-map.model";

// [GET] /admin/mind-maps
export const index = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const find: any = {
            userId,
            deleted: false
        };

        if (req.query.categoryId) {
            find.categoryId = req.query.categoryId;
        }

        const mindMaps = await MindMap.find(find)
            .populate("categoryId", "name")
            .sort({ createdAt: -1 });

        res.json({
            code: 200,
            data: mindMaps
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi khi lấy danh sách sơ đồ tư duy"
        });
    }
};

// [POST] /admin/mind-maps/create
export const create = async (req: Request, res: Response) => {
    try {
        req.body.userId = (req as any).user.id;
        const mindMap = new MindMap(req.body);
        await mindMap.save();

        res.json({
            code: 200,
            message: "Tạo sơ đồ tư duy thành công",
            data: mindMap
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi khi tạo sơ đồ tư duy"
        });
    }
};

// [PATCH] /admin/mind-maps/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await MindMap.updateOne({
            _id: id,
            userId: (req as any).user.id
        }, req.body);

        res.json({
            code: 200,
            message: "Cập nhật sơ đồ tư duy thành công"
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi khi cập nhật sơ đồ tư duy"
        });
    }
};

// [GET] /admin/mind-maps/detail/:id
export const detail = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const mindMap = await MindMap.findOne({
            _id: id,
            userId: (req as any).user.id,
            deleted: false
        }).populate("categoryId", "name");

        res.json({
            code: 200,
            data: mindMap
        });
    } catch (error) {
        res.json({
            code: 400,
            message: "Lỗi khi lấy chi tiết sơ đồ tư duy"
        });
    }
};
