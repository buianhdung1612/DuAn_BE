import mongoose, { Schema, Document } from 'mongoose';

export interface ISavingGoal extends Document {
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: Date;
    categoryId?: mongoose.Types.ObjectId;
    description?: string;
    recurringAmount?: number;
    recurringFrequency?: 'weekly' | 'bi-weekly' | 'monthly' | 'none';
    icon: string;
    color: string;
    status: 'active' | 'completed' | 'paused';
    deleted: boolean;
}

const SavingGoalSchema: Schema = new Schema({
    title: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date },
    categoryId: { type: Schema.Types.ObjectId, ref: 'FinanceCategory' },
    description: { type: String },
    recurringAmount: { type: Number, default: 0 },
    recurringFrequency: {
        type: String,
        enum: ['weekly', 'bi-weekly', 'monthly', 'none'],
        default: 'none'
    },
    icon: { type: String, default: 'solar:target-bold-duotone' },
    color: { type: String, default: '#00A76F' },
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
    deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

const SavingGoal = mongoose.model<ISavingGoal>('SavingGoal', SavingGoalSchema);
export default SavingGoal;
