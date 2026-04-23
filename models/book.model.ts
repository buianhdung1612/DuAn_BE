import mongoose from "mongoose";

const practiceSchema = new mongoose.Schema({
    title: String,
    frequency: {
        type: String,
        enum: ["daily", "weekly"],
        default: "daily"
    },
    importance: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
    },
    lastCompletedAt: Date,
    completedDates: [Date] // Lưu lịch sử các ngày đã thực hiện để thống kê thói quen
});

const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        author: String,
        description: String,
        avatar: String,
        status: {
            type: String,
            enum: ["reading", "finished", "archived"],
            default: "reading"
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CategoryBook"
        },
        blogId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Blog"
        },
        mindMapId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "MindMap"
        },
        practices: [practiceSchema],
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AccountAdmin",
            required: true
        },
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

const Book = mongoose.model("Book", bookSchema, "books");

export default Book;
