import { Router } from "express";
import multer from "multer";
import { uploadToCloudinary } from "../../helpers/uploadCloudinary";

const router = Router();
const upload = multer();

router.post("/", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ code: 400, message: "Không có file nào được tải lên" });
        }

        const url = await uploadToCloudinary(req.file.buffer);
        res.json({
            code: 200,
            message: "Tải lên thành công",
            data: url
        });
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ code: 500, message: "Lỗi khi tải hình ảnh lên Cloudinary" });
    }
});

export default router;
