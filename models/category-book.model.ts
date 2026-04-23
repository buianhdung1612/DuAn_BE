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

const CategoryBook = mongoose.model("CategoryBook", schema, "categories-book");

export default CategoryBook;
