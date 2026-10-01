import { Request, Response } from 'express';
import DocCategory from '../../models/doc-category.model';
import DocArticle from '../../models/doc-article.model';

export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await DocCategory.find({ deleted: false, status: "active" }).sort({ createdAt: "desc" }).lean();
        return res.json({ success: true, data: categories });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const getArticlesByCategory = async (req: Request, res: Response) => {
    try {
        const { categorySlug } = req.params;
        const category = await DocCategory.findOne({ slug: categorySlug, deleted: false, status: "active" }).lean();
        if (!category) return res.status(404).json({ success: false, message: "Danh mục không tồn tại" });

        const articles = await DocArticle.find({ 
            docCategoryId: category._id, 
            deleted: false, 
            status: "published" 
        })
        .select("title slug order parentId")
        .sort({ order: "asc" })
        .lean();

        return res.json({ 
            success: true, 
            data: {
                category,
                articles
            } 
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};

export const getArticleDetail = async (req: Request, res: Response) => {
    try {
        const { articleSlug } = req.params;
        const article = await DocArticle.findOne({ slug: articleSlug, deleted: false, status: "published" })
            .populate("docCategoryId", "name slug")
            .lean();
            
        if (!article) return res.status(404).json({ success: false, message: "Bài viết không tồn tại" });

        return res.json({ success: true, data: article });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
};
