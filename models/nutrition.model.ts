import mongoose, { Schema, Document } from 'mongoose';

export interface INutrition extends Document {
    date: Date;
    meals: {
        type: 'Sáng' | 'Trưa' | 'Chiều' | 'Tối' | 'Phụ';
        items: {
            name: string;
            calories: number;
            protein?: number;
            carbs?: number;
            fat?: number;
        }[];
    }[];
    waterIntake: number; // ml
    totalCalories: number;
    notes?: string;
}

const NutritionSchema: Schema = new Schema({
    date: { type: Date, default: Date.now, unique: true },
    meals: [{
        type: {
            type: String,
            enum: ['Sáng', 'Trưa', 'Chiều', 'Tối', 'Phụ'],
            required: true
        },
        items: [{
            name: { type: String, required: true },
            calories: { type: Number, required: true },
            protein: { type: Number },
            carbs: { type: Number },
            fat: { type: Number }
        }]
    }],
    waterIntake: { type: Number, default: 0 },
    totalCalories: { type: Number, default: 0 },
    notes: { type: String }
}, {
    timestamps: true
});

const Nutrition = mongoose.model<INutrition>('Nutrition', NutritionSchema);
export default Nutrition;
