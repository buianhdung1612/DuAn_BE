import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkout extends Document {
    title: string;
    date: Date;
    duration: number; // minutes
    notes?: string;
    exercises: {
        exercise: mongoose.Types.ObjectId;
        sets: {
            weight: number;
            reps: number;
        }[];
    }[];
}

const WorkoutSchema: Schema = new Schema({
    title: { type: String, required: true },
    date: { type: Date, default: Date.now },
    duration: { type: Number, default: 0 },
    notes: { type: String },
    exercises: [{
        exercise: { type: Schema.Types.ObjectId, ref: 'Exercise', required: true },
        sets: [{
            weight: { type: Number, required: true },
            reps: { type: Number, required: true }
        }]
    }]
}, {
    timestamps: true
});

const Workout = mongoose.model<IWorkout>('Workout', WorkoutSchema);
export default Workout;
