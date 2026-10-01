import mongoose from "mongoose";

const tacticSchema = new mongoose.Schema({
    title: { type: String, required: true },
    targetPerWeek: { type: Number, default: 7 },
});

const subGoalSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
});

const dailyFocusSchema = new mongoose.Schema({
    title: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    subGoals: [subGoalSchema]
});

const timeBlockSchema = new mongoose.Schema({
    title: { type: String, required: true },
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true }, // HH:mm
    dayIndex: { type: Number, required: true }, // 0 (Mon) - 6 (Sun)
    type: { type: String, enum: ["fixed", "scheduled"], default: "fixed" },
    tacticId: { type: mongoose.Schema.Types.ObjectId }, // Link to tactic if scheduled
});

const weeklyExecutionSchema = new mongoose.Schema({
    weekIndex: { type: Number, required: true }, // 1-13
    executions: [{
        tacticId: { type: mongoose.Schema.Types.ObjectId },
        completedDates: [Date], // For calendar view: which days was this done?
        isCompleted: { type: Boolean, default: false }, // For checklist view
    }],
    score: { type: Number, default: 0 },
    weeklyGoals: [dailyFocusSchema],
    dailyFocus: {
        type: Map,
        of: [dailyFocusSchema], // Key is dayIndex (0-6)
        default: {}
    }
});

const twelveWeekYearSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AccountAdmin",
            required: true,
        },
        title: { type: String, required: true },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        status: { type: String, enum: ["active", "completed"], default: "active" },
        goals: [{
            title: { type: String, required: true },
            description: { type: String },
            tactics: [tacticSchema],
        }],
        weeklyExecution: [weeklyExecutionSchema],
        timeBlocks: [timeBlockSchema], // The "Ideal Week" skeleton
        deleted: { type: Boolean, default: false },
        deletedAt: Date,
    },
    {
        timestamps: true,
    }
);

const TwelveWeekYear = mongoose.model("TwelveWeekYear", twelveWeekYearSchema, "twelve-week-years");

export default TwelveWeekYear;
