import mongoose, { Schema, Document } from 'mongoose';

export interface IFinanceTransaction extends Document {
    date: Date;
    type: 'income' | 'expense';
    amount: number;
    categoryId: mongoose.Types.ObjectId;
    description: string;
    note?: string;
    deleted: boolean;
}

const FinanceTransactionSchema: Schema = new Schema({
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['income', 'expense'], required: true },
    amount: { type: Number, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'FinanceCategory', required: true },
    description: { type: String, required: true },
    note: { type: String },
    deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

const FinanceTransaction = mongoose.model<IFinanceTransaction>('FinanceTransaction', FinanceTransactionSchema);
export default FinanceTransaction;
