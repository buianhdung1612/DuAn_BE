import mongoose from "mongoose";

const personalVisionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AccountAdmin",
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        deleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

const PersonalVision = mongoose.model("PersonalVision", personalVisionSchema, "personal-visions");

export default PersonalVision;
