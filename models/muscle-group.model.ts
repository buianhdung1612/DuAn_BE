import mongoose, { Schema, Document } from 'mongoose';

export interface IMuscleGroup extends Document {
    name: string;
    description?: string;
}

const MuscleGroupSchema: Schema = new Schema({
    name: { type: String, required: true },
    description: { type: String }
}, {
    timestamps: true
});

const MuscleGroup = mongoose.model<IMuscleGroup>('MuscleGroup', MuscleGroupSchema);
export default MuscleGroup;
