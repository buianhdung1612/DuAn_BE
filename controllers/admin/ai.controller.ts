import { Request, Response } from 'express';

const PROMPTS: Record<string, string> = {
    improve: "Hãy cải thiện văn bản sau đây để trôi chảy, chuyên nghiệp và truyền cảm hứng hơn, giữ nguyên định dạng HTML nếu có:",
    grammar: "Hãy sửa lỗi chính tả và ngữ pháp cho đoạn văn bản sau, giữ nguyên định dạng HTML nếu có:",
    continue: "Hãy viết tiếp nội dung cho đoạn văn bản sau một cách tự nhiên, hấp dẫn và sáng tạo, giữ nguyên định dạng HTML nếu có:",
    translate: "Hãy dịch đoạn văn bản sau sang tiếng Anh một cách tự nhiên nhất, giữ nguyên định dạng HTML nếu có:",
    explain_code: "Hãy giải thích đoạn mã lập trình sau một cách chi tiết và dễ hiểu:",
    summarize: "Hãy tóm tắt đoạn văn bản sau một cách ngắn gọn, súc tích và giữ lại các ý chính quan trọng:",
    vision_builder: "Dựa trên các ý tưởng sau, hãy viết thành một đoạn 'Tầm nhìn cá nhân' (Personal Vision) súc tích, chuyên nghiệp và đầy cảm hứng. Hãy sử dụng ngôi thứ nhất (Tôi):",
    nutrition_assistant: "Bạn là chuyên gia dinh dưỡng. Hãy phân tích thực phẩm hoặc bữa ăn sau đây và cung cấp thông tin dinh dưỡng. Chỉ trả về một đối tượng JSON duy nhất (không có markdown, không có lời dẫn) với định dạng: {\"name\": \"tên thực phẩm\", \"calories\": số_calo, \"protein\": số_protein_g, \"carbs\": số_carbs_g, \"fat\": số_fat_g}. Nếu là một danh sách, hãy trả về mảng các đối tượng đó trong trường 'items'. Thực phẩm:"
};

export const processAI = async (req: Request, res: Response) => {
    try {
        const { content, action } = req.body;

        if (!content) {
            return res.status(400).json({
                success: false,
                message: "Nội dung không được để trống!"
            });
        }

        const promptPrefix = PROMPTS[action] || PROMPTS.improve;
        
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content: "Bạn là một trợ lý viết lách chuyên nghiệp, am hiểu về phát triển cá nhân, lập trình và ngoại ngữ. Hãy phản hồi một cách súc tích, tinh tế và luôn giữ nguyên các thẻ HTML nếu văn bản đầu vào có chứa chúng. Chỉ trả về nội dung đã xử lý, không thêm lời dẫn giải."
                    },
                    {
                        role: "user",
                        content: `${promptPrefix}\n\n${content}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048,
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(JSON.stringify(errorData));
        }

        const data: any = await response.json();
        const aiResult = data.choices?.[0]?.message?.content || "";

        return res.json({
            success: true,
            message: "Xử lý AI thành công",
            data: aiResult
        });
    } catch (error) {
        console.error("Groq AI API Error:", error);
        return res.status(500).json({
            success: false,
            message: "Có lỗi xảy ra khi gọi AI Assistant!"
        });
    }
};
