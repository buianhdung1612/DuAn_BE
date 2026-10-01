import { Router } from "express";
import productRoutes from "./product.route";
import articleRoutes from "./article.route";
import authRoutes from "./auth.route";
import { docRoutes } from "./doc.route";

const router = Router();

router.use('/products', productRoutes);
router.use('/articles', articleRoutes);
router.use('/auth', authRoutes);
router.use('/docs', docRoutes);

export default router;
