import mongoose, { Schema, Document } from "mongoose";

export interface IVocabularyTopic extends Document {
    userId: string;
    title: string;
    description: string;
    color: string;
    deleted: boolean;
    deletedAt?: Date;
}

const VocabularyTopicSchema: Schema = new Schema(
    {
        userId: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        color: { type: String, default: "#1C252E" },
        deleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<IVocabularyTopic>("VocabularyTopic", VocabularyTopicSchema);
