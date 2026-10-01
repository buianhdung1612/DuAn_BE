import { Request, Response } from 'express';
import DocCategory from '../../models/doc-category.model';
import DocArticle from '../../models/doc-article.model';
import { convertToSlug } from '../../helpers/slug.helper';

// --- Category Functions ---

export const getCategories = async (req: Request, res: Response) => {
    try {
        const find: any = { deleted: false };
        if (req.query.status) find.status = req.query.status;

        const categories = await DocCategory.find(find).sort({ createdAt: "desc" }).lean();

        return res.json({
            success: true,
            message: "Lấy danh sách danh mục tài liệu thành công",
            data: categories
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        let slug = req.body.slug || convertToSlug(name);
        
        let slugCheck = await DocCategory.findOne({ slug, deleted: false });
        let count = 1;
        const originalSlug = slug;
        while (slugCheck) {
            slug = `${originalSlug}-${count}`;
            slugCheck = await DocCategory.findOne({ slug, deleted: false });
            count++;
        }
        req.body.slug = slug;

        const newCategory = new DocCategory(req.body);
        await newCategory.save();

        return res.status(201).json({ success: true, message: "Tạo danh mục thành công" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const updateCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await DocCategory.updateOne({ _id: id, deleted: false }, req.body);
        return res.json({ success: true, message: "Cập nhật danh mục thành công" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const hasArticles = await DocArticle.exists({ docCategoryId: id, deleted: false });
        if (hasArticles) {
            return res.status(400).json({ success: false, message: "Danh mục này vẫn còn bài viết!" });
        }
        await DocCategory.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
        return res.json({ success: true, message: "Xóa danh mục thành công" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

// --- Article Functions ---

export const getArticles = async (req: Request, res: Response) => {
    try {
        const find: any = { deleted: false };
        if (req.query.docCategoryId) find.docCategoryId = req.query.docCategoryId;
        if (req.query.status) find.status = req.query.status;

        const articles = await DocArticle.find(find).sort({ order: "asc", createdAt: "desc" }).lean();

        return res.json({
            success: true,
            message: "Lấy danh sách bài viết tài liệu thành công",
            data: articles
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const createArticle = async (req: Request, res: Response) => {
    try {
        const { title } = req.body;
        let slug = req.body.slug || convertToSlug(title);
        
        let slugCheck = await DocArticle.findOne({ slug, deleted: false });
        let count = 1;
        const originalSlug = slug;
        while (slugCheck) {
            slug = `${originalSlug}-${count}`;
            slugCheck = await DocArticle.findOne({ slug, deleted: false });
            count++;
        }
        req.body.slug = slug;

        const newArticle = new DocArticle(req.body);
        await newArticle.save();

        return res.status(201).json({ success: true, message: "Tạo bài viết tài liệu thành công" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const updateArticle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await DocArticle.updateOne({ _id: id, deleted: false }, req.body);
        return res.json({ success: true, message: "Cập nhật bài viết tài liệu thành công" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const deleteArticle = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await DocArticle.updateOne({ _id: id }, { deleted: true, deletedAt: new Date() });
        return res.json({ success: true, message: "Xóa bài viết tài liệu thành công" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const getArticleDetail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const article = await DocArticle.findOne({ _id: id, deleted: false }).lean();
        if (!article) return res.status(404).json({ success: false, message: "Không tìm thấy bài viết" });

        return res.json({ success: true, data: article });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};
