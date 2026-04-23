import mongoose from "mongoose";

const dailySummarySchema = new mongoose.Schema(
    {
        date: { type: Date, required: true },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AccountAdmin",
            required: true
        },
        items: [
            {
                type: { 
                    type: String, 
                    enum: ["blog", "mind-map", "vocabulary"], 
                    required: true 
                },
                itemId: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    required: true 
                },
                title: String, // Cache tiêu đề để hiển thị nhanh
            }
        ],
        reflection: { type: String, default: "" },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Đảm bảo mỗi người dùng chỉ có 1 bản tổng kết cho 1 ngày
dailySummarySchema.index({ date: 1, userId: 1 }, { unique: true });

const DailySummary = mongoose.model("DailySummary", dailySummarySchema, "daily-summaries");

export default DailySummary;
