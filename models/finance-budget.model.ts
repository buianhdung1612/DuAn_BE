import mongoose, { Schema, Document } from 'mongoose';

export interface IFinanceBudget extends Document {
    categoryId: mongoose.Types.ObjectId;
    amount: number;
    period: string; // Format: YYYY-MM
    deleted: boolean;
}

const FinanceBudgetSchema: Schema = new Schema({
    categoryId: { type: Schema.Types.ObjectId, ref: 'FinanceCategory', required: true },
    amount: { type: Number, required: true },
    period: { type: String, required: true },
    deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Compound index to ensure one budget per category per month
FinanceBudgetSchema.index({ categoryId: 1, period: 1 }, { unique: true });

const FinanceBudget = mongoose.model<IFinanceBudget>('FinanceBudget', FinanceBudgetSchema);
export default FinanceBudget;
