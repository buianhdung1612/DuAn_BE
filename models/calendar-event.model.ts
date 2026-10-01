import mongoose from "mongoose";

const schema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        start: {
            type: Date,
            required: true
        },
        end: {
            type: Date,
            required: true
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CategoryCalendar"
        },
        type: {
            type: String,
            default: 'event' // 'event' or 'task'
        },
        notes: String,
        description: String,
        isCompleted: {
            type: Boolean,
            default: false
        },
        allDay: {
            type: Boolean,
            default: false
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

const CalendarEvent = mongoose.model("CalendarEvent", schema, "calendar-events");

export default CalendarEvent;
