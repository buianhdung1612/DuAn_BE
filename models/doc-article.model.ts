import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        docCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DocCategory"
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "DocArticle",
            default: null
        },
        title: String,
        slug: String,
        content: String,
        order: {
            type: Number,
            default: 0
        },
        status: {
            type: String,
            enum: ["draft", "published"],
            default: "published"
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

const DocArticle = mongoose.model('DocArticle', schema, "doc-articles");

export default DocArticle;
