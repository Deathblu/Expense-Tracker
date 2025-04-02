const Income = require('../models/Income')
const Expense = require('../models/Expense')
const { isValidObjectId, Types } = require('mongoose');

// Dashboard data
exports.getDashboardData = async (req, res) => {
    try {
        const userId = req.user.id;
        const userObjectId = new Types.ObjectId(String(userId));

        // Fetch total incomes & expenses
        const totalIncome = await Income.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        console.log("totalIncome", { totalIncome, userId: isValidObjectId(userId) });

        const totalExpense = await Expense.aggregate([
            { $match: { userId: userObjectId } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);

        console.log("totalExpense", { totalExpense, userId: isValidObjectId(userId) });

        // Get Income Transaction in last 60 days
        const last60Income = await Income.find({
            userId,
            date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 })

        // Get total income for last 60 days
        const totIncome60 = last60Income.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        // Get Expense Transaction in last 30 days
        const last30Expense = await Expense.find({
            userId,
            date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        }).sort({ date: -1 })

        // Get total expense for last 30 days
        const totExpense30 = last30Expense.reduce(
            (sum, transaction) => sum + transaction.amount,
            0
        );

        // Fetch Last Transaction (Income + Expense)
        const lastTransactions = [
            ...(await Income.find({ userId }).sort({ date: -1 }).limit(5)).map(
                (txn) => ({
                    ...txn.toObject(),
                    type: "income",
                })
            ),
            ...(await Expense.find({ userId }).sort({ date: -1 }).limit(5)).map(
                (txn) => ({
                    ...txn.toObject(),
                    type: "expense",
                })
            ),
        ].sort((a, b) => b.date - a.date);

        // Final response
        res.json({
            totalBalance:
                (totalIncome[0]?.total || 0) - (totalExpense[0]?.total || 0),
            totalIncome: totalIncome[0]?.total || 0,
            totalExpense: totalExpense[0]?.total || 0,
            last30DaysExpenses: {
                total: totExpense30,
                transactions: last30Expense,
            },
            last60DaysIncome: {
                total: totIncome60,
                transactions: last60Income,
            },
            recentTransactions: lastTransactions,
        });
    } catch (err) {
        res.status(500).json({ message: "Server Error", err })
    }
}