import { Request, Response } from "express";
import CategoryBook from "../../models/category-book.model";
import slugify from "slugify";

// [GET] /admin/category-book
export const index = async (req: Request, res: Response) => {
    try {
        const find: any = {
            deleted: req.query.is_trash === "true" ? true : false
        };

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
            CategoryBook.find(find)
                .sort({ createdAt: "desc" })
                .limit(limitItems)
                .skip((page - 1) * limitItems)
                .lean(),
            CategoryBook.countDocuments(find)
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

// [POST] /admin/category-book/create
export const create = async (req: Request, res: Response) => {
    try {
        if (req.body.name) {
            req.body.slug = slugify(req.body.name, { lower: true });
        }
        const category = new CategoryBook(req.body);
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

// [PATCH] /admin/category-book/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        if (req.body.name) {
            req.body.slug = slugify(req.body.name, { lower: true });
        }
        await CategoryBook.updateOne({ _id: req.params.id }, req.body);
        res.json({ success: true, code: 200, message: "Cập nhật thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Cập nhật thất bại" });
    }
};

// [DELETE] /admin/category-book/delete/:id
export const deleteCategory = async (req: Request, res: Response) => {
    try {
        await CategoryBook.updateOne(
            { _id: req.params.id },
            { deleted: true, deletedAt: new Date() }
        );
        res.json({ success: true, code: 200, message: "Xóa thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Xóa thất bại" });
    }
};

// [PATCH] /admin/category-book/restore/:id
export const restore = async (req: Request, res: Response) => {
    try {
        await CategoryBook.updateOne(
            { _id: req.params.id },
            { deleted: false, $unset: { deletedAt: 1 } }
        );
        res.json({ success: true, code: 200, message: "Khôi phục thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Khôi phục thất bại" });
    }
};

// [DELETE] /admin/category-book/force-delete/:id
export const forceDelete = async (req: Request, res: Response) => {
    try {
        await CategoryBook.deleteOne({ _id: req.params.id });
        res.json({ success: true, code: 200, message: "Xóa vĩnh viễn thành công" });
    } catch (error) {
        res.json({ success: false, code: 500, message: "Xóa vĩnh viễn thất bại" });
    }
};
