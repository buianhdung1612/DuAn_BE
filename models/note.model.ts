import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Account",
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        topic: {
            type: String,
            trim: true,
            default: "Chung"
        },
        content: {
            type: String,
            default: ""
        },
        deleted: {
            type: Boolean,
            default: false
        },
        deletedAt: Date
    },
    {
        timestamps: true,
    }
);

const Note = mongoose.model("Note", noteSchema, "notes");

export default Note;
