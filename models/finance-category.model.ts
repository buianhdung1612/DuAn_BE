import mongoose, { Schema, Document } from 'mongoose';

export interface IFinanceCategory extends Document {
    title: string;
    icon: string;
    color: string;
    type: 'income' | 'expense';
    parentId?: mongoose.Types.ObjectId | null;
    deleted: boolean;
}

const FinanceCategorySchema: Schema = new Schema({
    title: { type: String, required: true },
    icon: { type: String, default: 'solar:folder-bold-duotone' },
    color: { type: String, default: '#004B50' },
    type: { type: String, enum: ['income', 'expense'], default: 'expense' },
    parentId: { type: Schema.Types.ObjectId, ref: 'FinanceCategory', default: null },
    deleted: { type: Boolean, default: false }
}, {
    timestamps: true
});

const FinanceCategory = mongoose.model<IFinanceCategory>('FinanceCategory', FinanceCategorySchema);
export default FinanceCategory;
