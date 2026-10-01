import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        name: String,
        slug: String,
        avatar: String,
        description: String,
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DocCategory",
            default: null
        },
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
        timestamps: true,
    }
);

const DocCategory = mongoose.model('DocCategory', schema, "doc-categories");

export default DocCategory;
