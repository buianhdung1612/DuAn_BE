import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        color: {
            type: String,
            default: "#00A76F"
        },
        status: {
            type: String,
            enum: ["active", "inactive"],
            default: "active"
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

const CategoryCalendar = mongoose.model("CategoryCalendar", schema, "categories-calendar");

export default CategoryCalendar;
