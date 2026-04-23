import mongoose from "mongoose";

const mindMapSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        data: { type: Object, required: true }, // Dữ liệu từ mind-elixir
        description: String,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AccountAdmin",
            required: true
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CategoryMindMap"
        },
        tags: [String],
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

const MindMap = mongoose.model("MindMap", mindMapSchema, "mind-maps");

export default MindMap;
