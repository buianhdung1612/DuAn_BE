import { Request, Response } from "express";
import CategoryMindMap from "../../models/category-mindmap.model";
import slugify from "slugify";

// [GET] /admin/category-mindmap
export const index = async (req: Request, res: Response) => {
    try {
        const find: any = {
            deleted: req.query.is_trash === "true" ? true : false
        };

        if (req.query.module) {
            find.module = req.query.module;
        }

        // Tìm kiếm
        const keyword = req.query.keyword || req.query.q;
        if (keyword) {
            const regex = new RegExp(`${keyword}`, "i");
            find.$or = [
                { name: regex },
                { description: regex }
            ];
        }

        if (req.query.status) {
            const statusArr = (req.query.status as string).split(',');
            find.status = { $in: statusArr };
        }

        // Phân trang
        const limitItems = parseInt(req.query.limit as string) || 20;
        let page = 1;
        if (req.query.page && parseInt(`${req.query.page}`) > 0) {
            page = parseInt(`${req.query.page}`);
        }

        const [recordList, totalRecords] = await Promise.all([
            CategoryMindMap.find(find)
                .sort({ createdAt: "desc" })
                .limit(limitItems)
                .skip((page - 1) * limitItems)
                .lean(),
            CategoryMindMap.countDocuments(find)
        ]);

        const pagination = {
            totalRecords,
            totalPages: Math.ceil(totalRecords / limitItems),
            currentPage: page,
            limit: limitItems
        };

        res.json({
            success: true,
            code: 200,
            message: "Thành công",
            data: {
                recordList,
                pagination
            },
        });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Lỗi hệ thống" });
    }
};

// [POST] /admin/category-mindmap/create
export const create = async (req: Request, res: Response) => {
    try {
        if (req.body.name) {
            req.body.slug = slugify(req.body.name, { lower: true });
        }
        const category = new CategoryMindMap(req.body);
        await category.save();

        res.json({
            success: true,
            code: 200,
            message: "Tạo danh mục thành công",
            data: category,
        });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Lỗi tạo danh mục" });
    }
};

// [PATCH] /admin/category-mindmap/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        if (req.body.name) {
            req.body.slug = slugify(req.body.name, { lower: true });
        }
        await CategoryMindMap.updateOne({ _id: req.params.id }, req.body);
        res.json({ success: true, code: 200, message: "Cập nhật thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Cập nhật thất bại" });
    }
};

// [DELETE] /admin/category-mindmap/delete/:id
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        await CategoryMindMap.updateOne(
            { _id: req.params.id },
            { deleted: true, deletedAt: new Date() }
        );
        res.json({ success: true, code: 200, message: "Xóa thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Xóa thất bại" });
    }
};

// [PATCH] /admin/category-mindmap/restore/:id
export const restore = async (req: Request, res: Response) => {
    try {
        await CategoryMindMap.updateOne(
            { _id: req.params.id },
            { deleted: false, $unset: { deletedAt: 1 } }
        );
        res.json({ success: true, code: 200, message: "Khôi phục thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Khôi phục thất bại" });
    }
};

// [DELETE] /admin/category-mindmap/force-delete/:id
export const forceDelete = async (req: Request, res: Response) => {
    try {
        await CategoryMindMap.deleteOne({ _id: req.params.id });
        res.json({ success: true, code: 200, message: "Xóa vĩnh viễn thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Xóa vĩnh viễn thất bại" });
    }
};
