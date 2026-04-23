import { Request, Response } from 'express';
import CategoryProduct from '../../models/category-product.model';
import { buildCategoryTree } from '../../helpers/category.helper';
import Product from '../../models/product.model';
import { generateRandomString } from '../../helpers/generate.helper';
import { convertToSlug } from '../../helpers/slug.helper';
import Brand from '../../models/brand.model';

// Danh mục sản phẩm
export const category = async (req: Request, res: Response) => {
    try {
        const find: any = {
            deleted: req.query.is_trash === "true" ? true : false
        };

        if (req.query.keyword) {
            const keyword = String(req.query.keyword);
            const slugKeyword = convertToSlug(keyword).replace(/-/g, " ");
            const regex = new RegExp(keyword, "i");
            find.$or = [
                { search: new RegExp(slugKeyword, "i") },
                { name: regex }
            ];
        }

        if (req.query.status) {
            const statusArr = (req.query.status as string).split(',');
            find.status = { $in: statusArr };
        }

        const limitItems = 20;
        const page = Math.max(1, parseInt(`${req.query.page}`) || 1);
        const skip = (page - 1) * limitItems;

        const [recordList, totalRecords, deletedCount] = await Promise.all([
            CategoryProduct.find(find)
                .sort({ createdAt: "desc" })
                .limit(limitItems)
                .skip(skip)
                .lean(),
            CategoryProduct.countDocuments(find),
            CategoryProduct.countDocuments({ deleted: true })
        ]);

        const parentIds = recordList
            .map(item => item.parent?.toString())
            .filter((id): id is string => !!id);

        let parentMap: Record<string, string> = {};

        if (parentIds.length > 0) {
            const parents = await CategoryProduct
                .find({ _id: { $in: parentIds } })
                .select("name")
                .lean();

            for (const parent of parents) {
                parentMap[parent._id.toString()] = (parent as any).name ?? "";
            }
        }

        const formattedList = recordList.map(item => ({
            ...item,
            parentName: item.parent ? parentMap[item.parent.toString()] || null : null,
            productCount: 0
        }));

        return res.json({
            success: true,
            message: "Lấy danh sách danh mục thành công",
            data: {
                recordList: formattedList,
                pagination: {
                    totalRecords,
                    totalPages: Math.ceil(totalRecords / limitItems),
                    currentPage: page,
                    limit: limitItems,
                    deletedCount
                }
            }
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Lỗi hệ thống khi lấy danh mục"
        });
    }
}

export const getCategoryTree = async (req: Request, res: Response) => {
    try {
        const categories = await CategoryProduct.find({
            deleted: false
        }).select("name parent slug avatar status").lean();

        const tree = buildCategoryTree(categories, "");

        return res.json({
            success: true,
            message: "Lấy cấu trúc cây danh mục thành công",
            data: tree
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống" });
    }
}

export const createCategory = async (req: Request, res: Response) => {
    try {
        let slug = req.body.slug || convertToSlug(req.body.name);
        let slugCheck = await CategoryProduct.findOne({ slug, deleted: false });
        let count = 1;
        const originalSlug = slug;
        while (slugCheck) {
            slug = `${originalSlug}-${count}`;
            slugCheck = await CategoryProduct.findOne({ slug, deleted: false });
            count++;
        }

        req.body.slug = slug;
        req.body.search = convertToSlug(req.body.name).replace(/-/g, " ");

        if (!req.body.parent || req.body.parent === "") {
            delete req.body.parent;
        }

        const newRecord = new CategoryProduct(req.body);
        await newRecord.save();

        res.json({ success: true, message: "Tạo danh mục thành công" });
    } catch (error) {
        res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ!" });
    }
}

export const getCategoryDetail = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const categoryDetail = await CategoryProduct.findOne({ _id: id, deleted: false }).lean();
        if (!categoryDetail) {
            return res.status(404).json({ success: false, message: "Không tìm thấy danh mục!" });
        }
        return res.json({ success: true, message: "Lấy chi tiết danh mục thành công", data: categoryDetail });
    } catch (error) {
        return res.status(400).json({ success: false, message: "ID không hợp lệ!" });
    }
}

export const editCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (req.body.name && !req.body.slug) req.body.slug = convertToSlug(req.body.name);
        if (req.body.slug) {
            let slug = req.body.slug;
            let slugCheck = await CategoryProduct.findOne({ _id: { $ne: id }, slug: slug, deleted: false }).lean();
            let count = 1;
            const originalSlug = slug;
            while (slugCheck) {
                slug = `${originalSlug}-${count}`;
                slugCheck = await CategoryProduct.findOne({ _id: { $ne: id }, slug: slug, deleted: false }).lean();
                count++;
            }
            req.body.slug = slug;
        }
        if (req.body.name) req.body.search = convertToSlug(req.body.name).replace(/-/g, " ");
        if (!req.body.parent || req.body.parent === "" || req.body.parent === "null") req.body.parent = null;

        await CategoryProduct.updateOne({ _id: id, deleted: false }, req.body);
        return res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ!" });
    }
}

export const deleteCategory = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        await CategoryProduct.updateOne({ _id: id }, { deleted: true, deletedAt: Date.now(), status: 'inactive' });
        return res.json({ success: true, message: "Xóa danh mục thành công!" });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Id không hợp lệ!" });
    }
};

export const restoreCategory = async (req: Request, res: Response) => {
    try {
        await CategoryProduct.updateOne({ _id: req.params.id }, { $set: { deleted: false }, $unset: { deletedAt: 1 } });
        res.json({ success: true, message: "Khôi phục danh mục thành công!" });
    } catch (e) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }
};

export const forceDeleteCategory = async (req: Request, res: Response) => {
    try {
        await CategoryProduct.deleteOne({ _id: req.params.id });
        res.json({ success: true, message: "Xóa vĩnh viễn danh mục thành công!" });
    } catch (e) {
        res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }
};

// Sản phẩm
export const list = async (req: Request, res: Response) => {
    try {
        const find: any = { deleted: req.query.is_trash === "true" ? true : false };
        if (req.query.status && req.query.status !== 'all') {
            const statusArr = Array.isArray(req.query.status) ? req.query.status : (typeof req.query.status === 'string' ? req.query.status.split(',') : [req.query.status]);
            find.status = { $in: statusArr };
        }
        const keyword = req.query.keyword || req.query.q;
        if (keyword) {
            const slugKeyword = convertToSlug(`${keyword}`).replace(/-/g, " ");
            const keywordRegex = new RegExp(String(keyword), "i");
            find.$or = [{ search: new RegExp(slugKeyword, "i") }, { name: keywordRegex }, { sku: keywordRegex }];
        }
        const limitItems = parseInt(`${req.query.limit}`) || 20;
        const page = Math.max(1, parseInt(`${req.query.page}`) || 1);
        const skip = (page - 1) * limitItems;

        const [recordList, totalRecord] = await Promise.all([
            Product.find(find).sort({ position: "desc" }).limit(limitItems).skip(skip).lean(),
            Product.countDocuments(find)
        ]);

        return res.json({
            success: true,
            message: "Lấy danh sách sản phẩm thành công",
            data: {
                recordList,
                pagination: {
                    totalRecords: totalRecord,
                    totalPages: Math.ceil(totalRecord / limitItems),
                    currentPage: page,
                    limit: limitItems
                }
            }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }
}

export const create = async (req: Request, res: Response) => {
    try {
        const [categoryList, brandList] = await Promise.all([
            CategoryProduct.find({ deleted: false }).lean(),
            Brand.find({ deleted: false }).lean()
        ]);
        const categoryTree = buildCategoryTree(categoryList);
        return res.json({
            success: true,
            message: "Dữ liệu tạo sản phẩm",
            data: { categoryList: categoryTree, brandList }
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Lỗi hệ thống!" });
    }
}

export const createPost = async (req: Request, res: Response) => {
    try {
        let slug = req.body.slug || convertToSlug(req.body.name);
        let slugCheck = await Product.findOne({ slug, deleted: false }).lean();
        let count = 1;
        const originalSlug = slug;
        while (slugCheck) {
            slug = `${originalSlug}-${count}`;
            slugCheck = await Product.findOne({ slug, deleted: false }).lean();
            count++;
        }
        req.body.slug = slug;
        req.body.sku = generateRandomString(10).toUpperCase();
        req.body.search = convertToSlug(`${req.body.name}`).replace(/-/g, " ");

        const newRecord = new Product(req.body);
        await newRecord.save();
        return res.json({ success: true, message: "Tạo sản phẩm thành công!", data: newRecord });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Dữ liệu không hợp lệ!" });
    }
}

export const edit = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const [productDetail, categoryList, brandList] = await Promise.all([
            Product.findOne({ _id: id, deleted: false }).lean(),
            CategoryProduct.find({ deleted: false }).lean(),
            Brand.find({ deleted: false }).lean()
        ]);
        if (!productDetail) return res.status(404).json({ success: false, message: "Không tìm thấy!" });

        return res.json({
            success: true,
            data: { productDetail, categoryList: buildCategoryTree(categoryList), brandList }
        });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Lỗi!" });
    }
}

export const editPatch = async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        if (req.body.name) req.body.search = convertToSlug(req.body.name).replace(/-/g, " ");
        await Product.updateOne({ _id: id, deleted: false }, req.body);
        return res.json({ success: true, message: "Cập nhật thành công!" });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Lỗi!" });
    }
}

export const deletePatch = async (req: Request, res: Response) => {
    try {
        await Product.updateOne({ _id: req.params.id }, { deleted: true, deletedAt: new Date() });
        return res.json({ success: true, message: "Xóa thành công!" });
    } catch (error) {
        return res.status(400).json({ success: false, message: "Lỗi!" });
    }
}
