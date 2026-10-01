import { Request, Response } from 'express';
import FinanceCategory from '../../models/finance-category.model';
import FinanceTransaction from '../../models/finance-transaction.model';
import FinanceBudget from '../../models/finance-budget.model';
import SavingGoal from '../../models/saving-goal.model';
import mongoose from 'mongoose';

// --- Categories ---
export const getCategories = async (req: Request, res: Response) => {
    try {
        const categories = await FinanceCategory.find({ deleted: false });
        res.json({ code: 200, data: categories });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
    }
};

export const createCategory = async (req: Request, res: Response) => {
    try {
        const category = new FinanceCategory(req.body);
        await category.save();
        res.json({ code: 200, message: "Đã tạo danh mục!", data: category });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Dữ liệu không hợp lệ" });
    }
};

// --- Transactions ---
export const getTransactions = async (req: Request, res: Response) => {
    try {
        const { categoryId, type, startDate, endDate, limit = 20, skip = 0 } = req.query;

        const query: any = { deleted: false };
        if (categoryId) query.categoryId = categoryId;
        if (type) query.type = type;
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate as string);
            if (endDate) query.date.$lte = new Date(endDate as string);
        }

        const transactions = await FinanceTransaction.find(query)
            .populate('categoryId')
            .sort({ date: -1 })
            .limit(Number(limit))
            .skip(Number(skip));

        const total = await FinanceTransaction.countDocuments(query);

        res.json({ code: 200, data: { transactions, total } });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
    }
};

export const createTransaction = async (req: Request, res: Response) => {
    try {
        const transaction = new FinanceTransaction(req.body);
        await transaction.save();
        res.json({ code: 200, message: "Đã ghi nhận giao dịch!", data: transaction });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Dữ liệu không hợp lệ" });
    }
};

export const editTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const transaction = await FinanceTransaction.findOneAndUpdate({ _id: id, deleted: false }, req.body, { new: true });
        if (!transaction) return res.status(404).json({ code: 404, message: "Không tìm thấy giao dịch" });
        res.json({ code: 200, message: "Đã cập nhật giao dịch", data: transaction });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Lỗi cập nhật" });
    }
};

export const deleteTransaction = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await FinanceTransaction.updateOne({ _id: id }, { deleted: true });
        res.json({ code: 200, message: "Đã xóa giao dịch" });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi server" });
    }
};

// --- Budgets ---
export const getBudgets = async (req: Request, res: Response) => {
    try {
        const { period } = req.query; // YYYY-MM
        const query: any = { deleted: false };
        if (period) query.period = period;

        const budgets = await FinanceBudget.find(query).populate('categoryId');
        res.json({ code: 200, data: budgets });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
    }
};

export const upsertBudget = async (req: Request, res: Response) => {
    try {
        const { categoryId, period, amount } = req.body;
        const budget = await FinanceBudget.findOneAndUpdate(
            { categoryId, period, deleted: false },
            { amount },
            { upsert: true, new: true }
        );
        res.json({ code: 200, message: "Cập nhật ngân sách thành công", data: budget });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Dữ liệu không hợp lệ" });
    }
};

// --- Saving Goals ---
export const getSavingGoals = async (req: Request, res: Response) => {
    try {
        const goals = await SavingGoal.find({ deleted: false }).sort({ createdAt: -1 });
        res.json({ code: 200, data: goals });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
    }
};

export const createSavingGoal = async (req: Request, res: Response) => {
    try {
        const goal = new SavingGoal(req.body);
        await goal.save();
        res.json({ code: 200, message: "Đã tạo mục tiêu tiết kiệm", data: goal });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Dữ liệu không hợp lệ" });
    }
};

export const addFundsToGoal = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { amount } = req.body;
        const goal = await SavingGoal.findOne({ _id: id, deleted: false });
        if (!goal) return res.status(404).json({ code: 404, message: "Mục tiêu không tồn tại" });

        goal.currentAmount += amount;
        if (goal.currentAmount >= goal.targetAmount) {
            goal.status = 'completed';
        }
        await goal.save();

        res.json({ code: 200, message: "Đã nạp tiền!", data: goal });
    } catch (error) {
        res.status(400).json({ code: 400, message: "Lỗi nạp tiền" });
    }
};

// --- Statistics & Reports ---
export const getFinancialSummary = async (req: Request, res: Response) => {
    try {
        const { month, year } = req.query; // Numbers
        const start = new Date(Number(year), Number(month) - 1, 1);
        const end = new Date(Number(year), Number(month), 0);

        const summary = await FinanceTransaction.aggregate([
            { $match: { deleted: false, date: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: '$type',
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const income = summary.find(s => s._id === 'income')?.total || 0;
        const expense = summary.find(s => s._id === 'expense')?.total || 0;
        const savings = income - expense;

        res.json({
            code: 200,
            data: { income, expense, savings, period: `${month}/${year}` }
        });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi thống kê tổng quan" });
    }
};

export const getBreakdownStats = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const match: any = { deleted: false, type: 'expense' };

        if (startDate || endDate) {
            match.date = {};
            if (startDate) match.date.$gte = new Date(startDate as string);
            if (endDate) match.date.$lte = new Date(endDate as string);
        }

        const stats = await FinanceTransaction.aggregate([
            { $match: match },
            {
                $group: {
                    _id: '$categoryId',
                    totalValue: { $sum: '$amount' }
                }
            },
            {
                $lookup: {
                    from: 'financecategories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $project: {
                    label: '$category.title',
                    value: '$totalValue',
                    color: '$category.color',
                    icon: '$category.icon'
                }
            },
            { $sort: { value: -1 } }
        ]);

        res.json({ code: 200, data: stats });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi thống kê chi tiết" });
    }
};

export const getTrendStats = async (req: Request, res: Response) => {
    try {
        const stats = await FinanceTransaction.aggregate([
            { $match: { deleted: false } },
            {
                $group: {
                    _id: {
                        month: { $month: '$date' },
                        year: { $year: '$date' },
                        type: '$type'
                    },
                    total: { $sum: '$amount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        res.json({ code: 200, data: stats });
    } catch (error) {
        res.status(500).json({ code: 500, message: "Lỗi thống kê xu hướng" });
    }
};
