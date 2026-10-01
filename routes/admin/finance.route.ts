import { Router } from 'express';
import * as controller from '../../controllers/admin/finance.controller';

const router: Router = Router();

// Categories
router.get('/categories', controller.getCategories);
router.post('/categories/create', controller.createCategory);

// Transactions
router.get('/transactions', controller.getTransactions);
router.post('/transactions/create', controller.createTransaction);
router.patch('/transactions/edit/:id', controller.editTransaction);
router.delete('/transactions/delete/:id', controller.deleteTransaction);

// Budgets
router.get('/budgets', controller.getBudgets);
router.post('/budgets/upsert', controller.upsertBudget);

// Saving Goals
router.get('/saving-goals', controller.getSavingGoals);
router.post('/saving-goals/create', controller.createSavingGoal);
router.patch('/saving-goals/add-funds/:id', controller.addFundsToGoal);

// Stats & Reports
router.get('/stats/summary', controller.getFinancialSummary);
router.get('/stats/breakdown', controller.getBreakdownStats);
router.get('/stats/trends', controller.getTrendStats);

export const financeRoutes: Router = router;
