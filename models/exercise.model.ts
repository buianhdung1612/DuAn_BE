import mongoose, { Schema, Document } from 'mongoose';

export interface IExercise extends Document {
    name: string;
    muscleGroup: mongoose.Types.ObjectId;
    youtubeLink?: string;
    notes?: string;
}

const ExerciseSchema: Schema = new Schema({
    name: { type: String, required: true },
    muscleGroup: { type: Schema.Types.ObjectId, ref: 'MuscleGroup', required: true },
    youtubeLink: { type: String },
    notes: { type: String }
}, {
    timestamps: true
});

const Exercise = mongoose.model<IExercise>('Exercise', ExerciseSchema);
export default Exercise;
