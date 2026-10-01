import { Request, Response } from "express";
import mongoose from "mongoose";
import Vocabulary from "../../models/vocabulary.model";
import axios from "axios";

// Hàm hỗ trợ lấy dữ liệu từ từ điển chuẩn (Free Dictionary API)
const getStandardData = async (word: string): Promise<{ ipa: string | null, audio: string | null, partOfSpeech: string | null }> => {
    try {
        if (word.trim().includes(" ")) return { ipa: null, audio: null, partOfSpeech: null };

        const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim().toLowerCase())}`);
        if (!res.ok) return { ipa: null, audio: null, partOfSpeech: null };

        const data = await res.json();
        const entry = data[0];

        let ipa = null;
        let audio = null;
        let partOfSpeech = entry.meanings?.[0]?.partOfSpeech || null;

        if (entry.phonetics) {
            const phonetic = entry.phonetics.find((p: any) => p.text && p.text.length > 0);
            ipa = phonetic ? phonetic.text : (entry.phonetic || null);

            // Ưu tiên lấy link audio có dữ liệu
            const audioEntry = entry.phonetics.find((p: any) => p.audio && p.audio.length > 0);
            audio = audioEntry ? audioEntry.audio : null;
            if (audio && audio.startsWith("//")) audio = "https:" + audio;
        }

        return { ipa, audio, partOfSpeech };
    } catch (error) {
        console.error("Standard Data Fetch Error:", error);
        return { ipa: null, audio: null, partOfSpeech: null };
    }
};

// Hàm lấy hoặc tạo Topic mặc định "Thông dụng"
const getOrCreateCommonTopic = async (userId: string) => {
    try {
        const TopicModel = mongoose.model("VocabularyTopic");
        let topic = await TopicModel.findOne({ userId, title: "Thông dụng", deleted: false });
        if (!topic) {
            topic = new TopicModel({
                userId,
                title: "Thông dụng",
                description: "Chủ đề mặc định cho các từ vựng chung",
                color: "#919EAB"
            });
            await topic.save();
        }
        return topic._id;
    } catch (error) {
        console.error("Default Topic Error:", error);
        return null;
    }
};

// [GET] /admin/vocabulary
export const index = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const { topicId, date } = req.query;
        const query: any = { userId, deleted: false };
        if (topicId && topicId !== "all") query.topicId = topicId;
        if (req.query.rootWord) query.rootWord = req.query.rootWord;

        if (date && date !== "all") {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            const end = new Date();
            end.setHours(23, 59, 59, 999);

            if (date === "today") {
                query.createdAt = { $gte: start, $lte: end };
            } else if (date === "yesterday") {
                start.setDate(start.getDate() - 1);
                end.setDate(end.getDate() - 1);
                query.createdAt = { $gte: start, $lte: end };
            }
        }

        const vocabularies = await Vocabulary.find(query)
            .populate("topicId")
            .sort({ createdAt: -1 });

        res.json({
            code: 200,
            message: "Thành công",
            data: vocabularies,
        });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi hệ thống" });
    }
};

// [POST] /admin/vocabulary/create
export const create = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        req.body.userId = userId;

        const existingVocab = await Vocabulary.findOne({
            userId,
            word: req.body.word,
            deleted: false
        });

        if (existingVocab) {
            return res.json({
                code: 400,
                message: "Từ vựng này đã tồn tại trong danh sách của bạn!"
            });
        }

        if (!req.body.topicId || req.body.topicId === "") {
            req.body.topicId = await getOrCreateCommonTopic(userId);
        }

        const vocabulary = new Vocabulary(req.body);
        await vocabulary.save();

        res.json({
            code: 200,
            message: "Thêm từ thành công",
            data: vocabulary,
        });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi hệ thống" });
    }
};

// [PATCH] /admin/vocabulary/edit/:id
export const edit = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await Vocabulary.updateOne({ _id: req.params.id, userId }, req.body);
        res.json({ code: 200, message: "Cập nhật thành công" });
    } catch (error) {
        res.json({ code: 500, message: "Cập nhật thất bại" });
    }
};

// [GET] /admin/vocabulary/phrasal-verb-groups
export const getPhrasalVerbGroups = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        
        const groups = await Vocabulary.aggregate([
            { 
                $match: { 
                    userId: userId, 
                    category: "phrasal_verb", 
                    deleted: false,
                    rootWord: { $exists: true, $ne: "" }
                } 
            },
            {
                $group: {
                    _id: "$rootWord",
                    count: { $sum: 1 },
                    verbs: { $push: "$word" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.json({
            code: 200,
            message: "Thành công",
            data: groups
        });
    } catch (error) {
        res.json({ code: 500, message: "Lỗi hệ thống" });
    }
};

// [DELETE] /admin/vocabulary/delete/:id
export const deleteVocab = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await Vocabulary.updateOne(
            { _id: req.params.id, userId },
            { deleted: true, deletedAt: new Date() }
        );
        res.json({ code: 200, message: "Xóa thành công" });
    } catch (error) {
        res.json({ code: 500, message: "Xóa thất bại" });
    }
};

// [POST] /admin/vocabulary/generate-ai
export const generateAI = async (req: Request, res: Response) => {
    try {
        const { word, category, onlyIpa } = req.body;
        let { topicId } = req.body;
        if (!word) {
            return res.status(400).json({ code: 400, message: "Thiếu từ vựng" });
        }

        const userId = (req as any).user.id;

        // Ưu tiên lấy dữ liệu từ từ điển chuẩn trước
        const dictData = await getStandardData(word);

        if (onlyIpa) {
            let ipa = dictData.ipa;
            let audio = dictData.audio;

            if (!ipa) {
                const prompt = `
                    Hãy đóng vai một chuyên gia ngôn ngữ Senior. Hãy cung cấp phiên âm IPA chuẩn Oxford/Cambridge cho từ hoặc cụm từ tiếng Anh: "${word}".
                    Trả về duy nhất JSON:
                    {
                        "ipa": "phiên âm IPA chuẩn"
                    }
                    Không giải thích thêm.
                `;
                const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.2,
                        response_format: { type: "json_object" }
                    })
                });

                const data: any = await aiRes.json();
                const aiContent = data.choices?.[0]?.message?.content || "{}";
                const result = JSON.parse(aiContent);
                ipa = result.ipa || "";
            }

            return res.json({
                code: 200,
                message: "AI đã lấy phiên âm thành công",
                data: {
                    ipa,
                    audio
                }
            });
        }

        if (!topicId || topicId === "") {
            topicId = await getOrCreateCommonTopic(userId);
        }

        let topicContext = "";
        if (topicId) {
            const topic = await mongoose.model("VocabularyTopic").findById(topicId);
            if (topic) topicContext = `trong ngữ cảnh chủ đề "${topic.title}"`;
        }

        // Sử dụng dữ liệu từ điển đã lấy ở trên
        

        let categoryNote = "";
        if (category === "phrasal_verb") categoryNote = "(Đây là Cụm động từ, hãy tập trung vào cách dùng giới từ và nghĩa đặc thù)";
        if (category === "collocation") categoryNote = "(Đây là Cách kết hợp từ, hãy tập trung vào các cặp từ thường đi chung)";
        if (category === "phrase") categoryNote = "(Đây là Câu giao tiếp, hãy tập trung vào tình huống sử dụng thực tế)";

        const prompt = `
            Hãy đóng vai một chuyên gia ngôn ngữ Senior. Với nội dung tiếng Anh "${word}" thuộc loại "${category || 'từ vựng'}" ${categoryNote} ${topicContext}, hãy cung cấp dữ liệu học tập định dạng JSON như sau:
            {
                "word": "${word}",
                "partOfSpeech": "chọn 1 trong các giá trị: n, v, adj, adv, phrase",
                "ipa": "${dictData.ipa || 'phiên âm IPA chuẩn'}",
                "audio": "${dictData.audio || ''}",
                "definition": "nghĩa tiếng Việt CỰC KỲ NGẮN GỌN",
                "examples": [
                    {
                        "title": "cấu trúc/cách dùng phổ biến",
                        "sentences": [
                            {"text": "câu ví dụ tiếng Anh 1", "translation": "dịch nghĩa tiếng Việt 1"},
                            {"text": "câu ví dụ tiếng Anh 2", "translation": "dịch nghĩa tiếng Việt 2"}
                        ]
                    }
                ],
                "wordFamily": [
                    {
                        "word": "từ cùng gốc", 
                        "ipa": "phiên âm", 
                        "partOfSpeech": "n/v/adj/adv", 
                        "definition": "nghĩa", 
                        "note": "mẹo nhớ",
                        "examples": [{ "title": "Ví dụ", "sentences": [{"text": "ví dụ", "translation": "dịch"}] }],
                        "shouldStudy": false
                    }
                ],
                "relatedWords": [
                    {
                        "word": "từ liên quan", 
                        "ipa": "phiên âm", 
                        "partOfSpeech": "n/v/adj/adv", 
                        "definition": "nghĩa",
                        "note": "mẹo nhớ",
                        "examples": [{ "title": "Ví dụ", "sentences": [{"text": "ví dụ", "translation": "dịch"}] }],
                        "shouldStudy": false
                    }
                ],
                "mnemonic": "mẹo ghi nhớ cực hay (Visual or Story based)"
            }
            Lưu ý: Mục "definition" chỉ được chứa nghĩa cốt lõi nhất, tối đa 3-5 từ. Chỉ trả về JSON duy nhất, không thêm văn bản nào khác.
        `;

        const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.7,
                response_format: { type: "json_object" }
            })
        });

        const data: any = await aiRes.json();
        const aiContent = data.choices?.[0]?.message?.content || "{}";
        const result = JSON.parse(aiContent);

        // Ghi đè dữ liệu từ điển chuẩn nếu có
        if (dictData.ipa) result.ipa = dictData.ipa;
        if (dictData.audio) result.audio = dictData.audio;
        if (dictData.partOfSpeech) result.partOfSpeech = dictData.partOfSpeech;

        res.json({
            code: 200,
            message: "AI đã tạo xong",
            data: result
        });

    } catch (error) {
        console.error("AI Vocab Error:", error);
        res.status(500).json({ code: 500, message: "AI gặp sự cố" });
    }
};

/**
 * [POST] /admin/vocabulary/review/:id
 * Cập nhật SRS dựa trên thuật toán SM-2
 */
export const review = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { quality } = req.body; // Mong đợi 0, 3, 4, 5 từ frontend
        const userId = (req as any).user.id;

        const vocab = await Vocabulary.findOne({ _id: id, userId });
        if (!vocab) return res.status(404).json({ code: 404, message: "Không tìm thấy từ" });

        let { interval, easeFactor, repetitionCount } = vocab;

        // quality (q) trong SM-2: 0-5. 
        // Frontend đang gửi 0 (Again), 3 (Hard), 4 (Good), 5 (Easy)
        const q = Number(quality);

        if (q >= 3) {
            if (repetitionCount === 0) {
                interval = 1;
            } else if (repetitionCount === 1) {
                interval = 6;
            } else {
                interval = Math.round(interval * easeFactor);
            }
            repetitionCount++;
        } else {
            repetitionCount = 0;
            interval = 1;
        }

        // Cập nhật easeFactor theo thuật toán SM-2
        easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
        if (easeFactor < 1.3) easeFactor = 1.3;

        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + interval);

        await Vocabulary.updateOne(
            { _id: id },
            {
                interval,
                easeFactor,
                repetitionCount,
                nextReview,
                level: Math.min(5, repetitionCount)
            }
        );

        res.json({ code: 200, message: "Đã ghi nhận kết quả" });

    } catch (error) {
        res.json({ code: 500, message: "Lỗi cập nhật SRS" });
    }
};

// [POST] /admin/vocabulary/generate-bulk
export const createBulkAI = async (req: Request, res: Response) => {
    try {
        const { words } = req.body;
        let { topicId } = req.body;
        const userId = (req as any).user.id;

        if (!words || !Array.isArray(words) || words.length === 0) {
            return res.status(400).json({ code: 400, message: "Danh sách từ trống" });
        }

        if (!topicId || topicId === "") {
            topicId = await getOrCreateCommonTopic(userId);
        }

        let topicContext = "";
        if (topicId) {
            const topic = await mongoose.model("VocabularyTopic").findById(topicId);
            if (topic) topicContext = `trong ngữ cảnh chủ đề "${topic.title}"`;
        }

        const prompt = `
            Hãy đóng vai một chuyên gia ngôn ngữ Senior. Tôi cung cấp danh sách các mục tiếng Anh (mỗi dòng là một mục). 
            Nhiệm vụ của bạn:
            1. **Giữ nguyên cấu trúc**: Mỗi mục tôi cung cấp phải tương ứng với DUY NHẤT một đối tượng JSON trong kết quả. KHÔNG ĐƯỢC tách một cụm từ hoặc câu của tôi ra thành nhiều từ riêng lẻ.
            2. **Chuẩn hóa**: Đưa các động từ về dạng nguyên thể (Base form) (ví dụ: 'dialed' -> 'dial').
            3. **Lọc nhiễu**: Loại bỏ các ghi chú thừa, chỉ giữ lại nội dung cốt lõi của từ/cụm từ/câu.
            4. **Phân loại**: BẮT BUỘC chọn 1 trong: 'word', 'phrasal_verb', 'collocation', 'phrase'.
            5. **Từ loại**: Xác định từ loại (n, v, adj, adv...).
            6. **Tạo nội dung**: Trả về dữ liệu học tập đầy đủ với IPA chuẩn Oxford. ${topicId ? 'Hãy lấy ví dụ và mẹo nhớ liên quan đến chủ đề đã cho.' : ''}

            Danh sách các mục cần xử lý:
            ${words.join("\n")}

            Trả về kết quả duy nhất dưới dạng JSON có khóa "vocabularies" là mảng các đối tượng:
            {
                "vocabularies": [
                    {
                        "word": "nội dung cốt lõi đã chuẩn hóa",
                        "partOfSpeech": "n/v/adj/adv...",
                        "category": "word/phrasal_verb/collocation/phrase",
                        "ipa": "phiên âm ISO/Oxford",
                        "audio": "link file mp3 âm thanh nếu tìm thấy",
                        "definition": "nghĩa tiếng Việt CỰC KỲ NGẮN (tối đa 3-5 từ)",
                        "examples": [{"title": "Ví dụ", "sentences": [{"text": "ví dụ", "translation": "dịch nghĩa"}]}],
                        "wordFamily": [{"word": "từ", "ipa": "ipa", "partOfSpeech": "loại", "definition": "nghĩa", "note": "mẹo", "examples": [{"title": "Ví dụ", "sentences": [{"text": "ví dụ", "translation": "dịch"}]}], "shouldStudy": false}],
                        "relatedWords": [{"word": "từ", "ipa": "ipa", "partOfSpeech": "loại", "definition": "nghĩa", "note": "mẹo", "examples": [{"title": "Ví dụ", "sentences": [{"text": "ví dụ", "translation": "dịch"}]}], "shouldStudy": false}]
                    }
                ]
            }
            Lưu ý: Mục "definition" chỉ được chứa nghĩa cốt lõi nhất. Số lượng phần tử trong mảng "vocabularies" phải BẰNG ĐÚNG số lượng mục tôi đã cung cấp. Chỉ trả về JSON, không thêm văn bản.
        `;

        const aiRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: prompt }],
                response_format: { type: "json_object" }
            })
        });

        const data = await aiRes.json();
        const contentStr = data.choices?.[0]?.message?.content || "{}";
        const content = JSON.parse(contentStr);

        const vocabList = Array.isArray(content) ? content : (content.vocabularies || content.data || Object.values(content)[0]);

        if (!Array.isArray(vocabList)) {
            throw new Error("Dữ liệu AI trả về không đúng định dạng mảng");
        }

        const savedVocabs = [];
        const validCategories = ["word", "phrasal_verb", "collocation", "phrase"];

        for (const item of vocabList) {
            if (!item.word) continue;

            // Thử lấy dữ liệu từ điển chuẩn cho từng từ mẫu nếu AI làm chưa tốt
            if (!item.ipa || item.ipa.includes("?") || !item.audio) {
                const sData = await getStandardData(item.word);
                if (sData.ipa) item.ipa = sData.ipa;
                if (sData.audio) item.audio = sData.audio;
                if (sData.partOfSpeech && (!item.partOfSpeech || item.partOfSpeech.startsWith("từ loại"))) {
                    item.partOfSpeech = sData.partOfSpeech;
                }
            }

            const category = validCategories.includes(item.category) ? item.category : "word";

            const newVocab = new Vocabulary({
                ...item,
                category,
                topicId,
                userId,
                nextReview: new Date(),
                level: 0,
                interval: 0,
                easeFactor: 2.5
            });
            await newVocab.save();
            savedVocabs.push(newVocab);
        }

        res.json({
            code: 200,
            message: `Đã xử lý thành công ${savedVocabs.length} từ`,
            data: savedVocabs
        });

    } catch (error: any) {
        console.error("Bulk AI Error:", error);
        res.status(500).json({ code: 500, message: error.message || "Lỗi xử lý hàng loạt" });
    }
};

// [POST] /admin/vocabulary/generate-note-ai
export const generateNoteAI = async (req: Request, res: Response) => {
    try {
        const { word, prompt } = req.body;
        if (!word || !prompt) {
            return res.status(400).json({ code: 400, message: "Thiếu thông tin để AI ghi chú" });
        }

        const Groq = (await import("groq-sdk")).default;
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Bạn là một trợ lý giảng dạy tiếng Anh cao cấp. 
                    Nhiệm vụ: Giải thích yêu cầu của người dùng về từ vựng.
                    Yêu cầu định dạng: 
                    1. Sử dụng HOÀN TOÀN HTML (Sử dụng <p>, <br>, <b>, <i>, <ul>, <li>). 
                    2. KHÔNG sử dụng Markdown (không dùng **, ###, [link]...).
                    3. Trình bày thoáng đãng, chia đoạn rõ ràng.
                    4. Các câu ví dụ phải bằng TIẾNG ANH (có thể có dịch nghĩa tiếng Việt bên dưới từng ví dụ).`
                },
                {
                    role: "user",
                    content: `Hãy giải thích về: "${word}". Cụ thể: "${prompt}". TRẢ VỀ ĐỊNH DẠNG HTML.`
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.6,
        });

        const content = chatCompletion.choices[0]?.message?.content || "";

        res.json({
            code: 200,
            message: "AI đã tạo ghi chú thành công",
            data: content
        });
    } catch (error) {
        console.error("Generate Note AI Error:", error);
        res.status(500).json({ code: 500, message: "Lỗi AI khi tạo ghi chú" });
    }
};

export const statistics = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;

        // Count totals
        const total = await Vocabulary.countDocuments({ userId, deleted: false });

        // Count per level (0 to 5)
        const levels = await Vocabulary.aggregate([
            { $match: { userId, deleted: false } },
            { $group: { _id: "$level", count: { $sum: 1 } } }
        ]);

        // Count per category (word, phrasal_verb, collocation, phrase)
        const categories = await Vocabulary.aggregate([
            { $match: { userId, deleted: false } },
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Count of words that need review today (nextReview <= now)
        const dueCount = await Vocabulary.countDocuments({
            userId,
            deleted: false,
            nextReview: { $lte: new Date() }
        });

        // Format level breakdown to always contain 0 to 5
        const levelBreakdown = Array.from({ length: 6 }, (_, i) => {
            const found = levels.find((l: any) => l._id === i);
            return {
                level: i,
                label: i === 0 ? "Mới học" : `Cấp độ ${i}`,
                count: found ? found.count : 0
            };
        });

        // Format category breakdown
        const categoryLabels: Record<string, string> = {
            word: "Từ đơn",
            phrasal_verb: "Cụm động từ",
            collocation: "Cụm từ cố định",
            phrase: "Mẫu câu",
            lexical_set: "Nhóm từ vựng"
        };
        
        // Ensure standard categories exist in breakdown even if count is 0
        const stdCategories = ["word", "phrasal_verb", "collocation", "phrase"];
        const categoryBreakdown = stdCategories.map((catKey: string) => {
            const found = categories.find((c: any) => c._id === catKey);
            return {
                category: catKey,
                label: categoryLabels[catKey] || catKey,
                count: found ? found.count : 0
            };
        });

        // Also add any other categories not in the standard list
        categories.forEach((c: any) => {
            if (!stdCategories.includes(c._id)) {
                categoryBreakdown.push({
                    category: c._id,
                    label: categoryLabels[c._id] || c._id,
                    count: c.count
                });
            }
        });

        res.json({
            code: 200,
            message: "Thành công",
            data: {
                total,
                dueCount,
                levelBreakdown,
                categoryBreakdown
            }
        });
    } catch (error) {
        console.error("Vocabulary stats error:", error);
        res.json({ code: 500, message: "Lỗi thống kê từ vựng" });
    }
};
