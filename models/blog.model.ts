import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        name: String,
        slug: String,
        category: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "CategoryBlog"
        }],
        images: [String],
        description: String,
        content: String,
        keyPoints: {
            type: [String],
            default: []
        },
        status: {
            type: String,
            enum: ["draft", "published", "archived"], // draft – Bản nháp, published – Đã xuất bản, archived – Đã lưu trữ
            default: "draft"
        },
        module: {
            type: String,
            enum: ["english", "programming"],
            default: "programming"
        },
        view: {
            type: Number,
            default: 0
        },
        search: String,
        publishAt: Date,
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AccountAdmin"
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AccountAdmin"
        }
    },
    {
        timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
    }
);

const Blog = mongoose.model('Blog', schema, "blogs");

export default Blog;