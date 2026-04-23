import { Request, Response } from 'express';
import Product from '../../models/product.model';
import CategoryProduct from '../../models/category-product.model';
import Brand from '../../models/brand.model';

// [GET] /api/v1/product
export const index = async (req: Request, res: Response) => {
    try {
        const find: any = {
            deleted: false,
            status: "active"
        };

        if (req.query.categorySlug) {
            const categoryRecord = await CategoryProduct.findOne({
                slug: req.query.categorySlug as string,
                deleted: false,
                status: "active"
            }).lean();
            if (categoryRecord) {
                find.category = { $in: [categoryRecord._id] };
            }
        }

        if (req.query.brandSlug) {
            const brandRecord = await Brand.findOne({
                slug: req.query.brandSlug as string,
                deleted: false,
                status: "active"
            }).lean();
            if (brandRecord) {
                find.brandId = brandRecord._id;
            }
        }

        if (req.query.keyword) {
            const keyword = req.query.keyword as string;
            const regex = new RegExp(keyword, "i");
            find.$or = [{ name: regex }, { sku: regex }];
        }

        const limit = parseInt(req.query.limit as string) || 9;
        const page = parseInt(req.query.page as string) || 1;
        const skip = (page - 1) * limit;

        const [products, totalItems] = await Promise.all([
            Product.find(find).sort({ position: "desc" }).skip(skip).limit(limit).lean(),
            Product.countDocuments(find)
        ]);

        return res.json({
            success: true,
            data: { products, totalItems, totalPages: Math.ceil(totalItems / limit), currentPage: page }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }
}

export const detail = async (req: Request, res: Response) => {
    try {
        const productDetail: any = await Product.findOne({
            slug: req.params.slug,
            deleted: false,
            status: "active"
        }).lean();

        if (!productDetail) return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });

        return res.json({ success: true, data: { productDetail, attributeList: [] } });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }
}
