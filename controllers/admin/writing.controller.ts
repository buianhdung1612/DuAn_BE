import { Request, Response } from "express";
import Writing from "../../models/writing.model";

// [GET] /admin/writing
export const index = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const recordList = await Writing.find({ userId, deleted: false }).sort({ createdAt: -1 });

        res.json({
            code: 200,
            message: "Thành công",
            data: recordList
        });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi lấy danh sách bài viết" });
    }
};

// [GET] /admin/writing/detail/:id
export const detail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const record = await Writing.findOne({ _id: id, userId, deleted: false });
        if (!record) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy bài viết" });
        }

        res.json({
            code: 200,
            message: "Thành công",
            data: record
        });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi lấy chi tiết bài viết" });
    }
};

// [POST] /admin/writing/create
export const create = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const prompt = req.body.prompt || "";
        const titleVal = prompt.split("\n")[0].trim().slice(0, 80) + (prompt.length > 80 ? "..." : "");

        const newRecord = new Writing({
            ...req.body,
            title: titleVal || "Chủ đề luyện viết",
            userId
        });
        await newRecord.save();

        res.json({
            code: 200,
            message: "Tạo bài viết thành công",
            data: newRecord
        });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi tạo bài viết" });
    }
};

// [PATCH] /admin/writing/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const updateData = { ...req.body };
        if (req.body.prompt) {
            const prompt = req.body.prompt;
            updateData.title = prompt.split("\n")[0].trim().slice(0, 80) + (prompt.length > 80 ? "..." : "");
        }

        const record = await Writing.findOneAndUpdate(
            { _id: id, userId, deleted: false },
            { $set: updateData },
            { new: true }
        );

        if (!record) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy bài viết" });
        }

        res.json({
            code: 200,
            message: "Cập nhật thành công",
            data: record
        });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi cập nhật bài viết" });
    }
};

// [DELETE] /admin/writing/delete/:id
export const deleteWriting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const record = await Writing.findOneAndUpdate(
            { _id: id, userId, deleted: false },
            { $set: { deleted: true, deletedAt: new Date() } }
        );

        if (!record) {
            return res.status(404).json({ code: 404, message: "Không tìm thấy bài viết" });
        }

        res.json({
            code: 200,
            message: "Xóa bài viết thành công"
        });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi xóa bài viết" });
    }
};

// [POST] /admin/writing/generate-feedback
export const generateFeedback = async (req: Request, res: Response) => {
    try {
        const { prompt, myWriting } = req.body;
        if (!prompt || !myWriting) {
            return res.status(400).json({ code: 400, message: "Thiếu đề bài hoặc bài viết của bạn" });
        }

        const aiPrompt = `
            Hãy đóng vai một giám khảo chấm thi IELTS Writing Senior. Tôi sẽ cung cấp đề bài và bài viết tiếng Anh của học viên.
            Nhiệm vụ của bạn:
            1. Phân tích chi tiết lỗi ngữ pháp, từ vựng và sự mạch lạc trong bài viết.
            2. Viết lại bài của học viên theo hướng tự nhiên hơn, nâng cấp từ vựng sang từ vựng học thuật.
            3. Viết nhận xét, sửa lỗi chi tiết bằng tiếng Việt trong một báo cáo HTML/Tiptap chuẩn đẹp.
            
            Thông tin:
            - Đề bài: ${prompt}
            - Bài viết của tôi: ${myWriting}

            Yêu cầu cấu trúc báo cáo trả về (định dạng HTML đẹp):
            <h3>📊 Đánh giá tổng quan (Overall Score)</h3>
            <p>Đánh giá ước lượng điểm (ví dụ: Band 5.5 - 6.0) kèm theo tóm tắt điểm mạnh, điểm yếu.</p>
            
            <h3>❌ Các lỗi sai chính & Sửa đổi</h3>
            <ul>
               <li><strong>Lỗi:</strong> [ghi từ sai] &rarr; <strong>Sửa:</strong> [từ đúng] - <em>Giải thích tại sao sai.</em></li>
            </ul>

            <h3>💡 Phiên bản viết lại tối ưu (Improved Version)</h3>
            <p><em>[Viết lại đoạn văn hoặc toàn bộ bài viết một cách tự nhiên, cao cấp hơn]</em></p>
            
            Chỉ trả về chuỗi nội dung báo cáo dạng HTML, không trả thêm bất kỳ văn bản giải thích hay bọc markdown nào bên ngoài.
        `;

        const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: aiPrompt }],
                temperature: 0.7
            })
        });

        const data: any = await aiRes.json();
        const feedback = data.choices?.[0]?.message?.content || "Không có góp ý nào từ AI.";

        res.json({
            code: 200,
            message: "AI đã phân tích bài viết thành công",
            data: feedback
        });
    } catch (error) {
        console.error("AI Writing Feedback Error:", error);
        res.status(500).json({ code: 500, message: "Lỗi AI phân tích bài viết" });
    }
};
