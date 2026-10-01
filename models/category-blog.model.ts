import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        name: String,
        slug: String,
        parent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CategoryBlog",
            default: null
        },
        description: String,
        avatar: String,
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
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
        deleted: {
            type: Boolean,
            default: false
        },
        search: String,
        deletedAt: Date
    },
    {
        timestamps: true, // Tự động sinh ra trường createdAt và updatedAt
    }
);

const CategoryBlog = mongoose.model("CategoryBlog", schema, "categories-blog");

export default CategoryBlog;