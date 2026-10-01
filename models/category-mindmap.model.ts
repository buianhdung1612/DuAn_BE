import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        name: String,
        slug: String,
        parent: String,
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
        deleted: {
            type: Boolean,
            default: false
        },
        search: String,
        deletedAt: Date
    },
    {
        timestamps: true,
    }
);

const CategoryMindMap = mongoose.model("CategoryMindMap", schema, "categories-mindmap");

export default CategoryMindMap;
