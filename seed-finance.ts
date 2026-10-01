import mongoose from 'mongoose';
import FinanceCategory from './models/finance-category.model';
import FinanceTransaction from './models/finance-transaction.model';
import FinanceBudget from './models/finance-budget.model';
import SavingGoal from './models/saving-goal.model';
import dotenv from 'dotenv';

dotenv.config();

const MOCK_CATEGORIES = [
    { title: 'Nhà cửa & Tiện ích', icon: 'solar:home-bold-duotone', color: '#1C252E', type: 'expense' },
    { title: 'Ăn uống', icon: 'solar:chef-hat-bold-duotone', color: '#00A76F', type: 'expense' },
    { title: 'Giải trí', icon: 'solar:clapperboard-edit-bold-duotone', color: '#FFAB00', type: 'expense' },
    { title: 'Di chuyển', icon: 'solar:bus-bold-duotone', color: '#8E33FF', type: 'expense' },
    { title: 'Lương thưởng', icon: 'solar:wad-of-money-bold-duotone', color: '#004B50', type: 'income' },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.DATABASE as string);
        console.log("Đã kết nối MongoDB");

        // Clear cũ
        await FinanceCategory.deleteMany({});
        await FinanceTransaction.deleteMany({});
        await FinanceBudget.deleteMany({});
        await SavingGoal.deleteMany({});

        // Thêm Categories
        const createdCategories = await FinanceCategory.create(MOCK_CATEGORIES);
        console.log("Đã seed Categories");

        // Thêm Transactions mẫu
        const now = new Date();
        const transactions = [
            { description: 'Tiền thuê nhà', amount: 1200, categoryId: createdCategories[0]._id, type: 'expense', date: now },
            { description: 'Ăn tối Sushi', amount: 150, categoryId: createdCategories[1]._id, type: 'expense', date: now },
            { description: 'Vé xem phim', amount: 50, categoryId: createdCategories[2]._id, type: 'expense', date: now },
            { description: 'Đổ xăng', amount: 80, categoryId: createdCategories[3]._id, type: 'expense', date: now },
            { description: 'Lương tháng', amount: 5000, categoryId: createdCategories[4]._id, type: 'income', date: now },
        ];
        await FinanceTransaction.create(transactions);
        console.log("Đã seed Transactions mẫu");

        // Thêm Budgets mẫu cho tháng này
        const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const budgets = createdCategories.filter(c => c.type === 'expense').map(c => ({
            categoryId: c._id,
            amount: c.title === 'Nhà cửa & Tiện ích' ? 1500 : 500,
            period
        }));
        await FinanceBudget.create(budgets);
        console.log("Đã seed Budgets mẫu");

        // Thêm Saving Goals
        const goals = [
            { title: 'Quỹ khẩn cấp', targetAmount: 10000, currentAmount: 6500, icon: 'solar:shield-warning-bold-duotone', color: '#1976D2' },
            { title: 'Mua xe mới', targetAmount: 25000, currentAmount: 8750, icon: 'solar:car-bold-duotone', color: '#388E3C' },
        ];
        await SavingGoal.create(goals);
        console.log("Đã seed Saving Goals mẫu");

        console.log("Seeding hoàn tất!");
        process.exit();
    } catch (error) {
        console.error("Lỗi seeding:", error);
        process.exit(1);
    }
};

seed();
