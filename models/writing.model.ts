import mongoose, { Schema, Document } from "mongoose";

export interface IWriting extends Document {
    userId: string;
    title: string;
    prompt: string;
    promptVi?: string;
    myWriting: string;
    sampleWriting?: string;
    feedback?: string;
    deleted: boolean;
    deletedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const WritingSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        title: { type: String, required: true },
        prompt: { type: String, required: true },
        promptVi: { type: String, default: "" },
        myWriting: { type: String, default: "" },
        sampleWriting: { type: String, default: "" },
        feedback: { type: String, default: "" },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date }
    },
    { timestamps: true }
);

export default mongoose.model<IWriting>("Writing", WritingSchema);
