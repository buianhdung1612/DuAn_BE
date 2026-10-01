import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: String,
        start: { type: Date, required: true },
        end: { type: Date },
        isCompleted: { type: Boolean, default: false },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'medium'
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Task',
            default: null
        },
        tacticId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TwelveWeekYear',
            default: null
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CategoryCalendar',
            default: null
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

const Task = mongoose.model("Task", taskSchema, "tasks");

export default Task;
