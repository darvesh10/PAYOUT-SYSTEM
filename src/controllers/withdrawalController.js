const withdrawalService = require("../services/withdrawalService");

const createWithdrawal = async (req, res, next) => {
    try {
        const { userId, amount } = req.body;
        if (!userId || !amount) {
            return res.status(400).json({ success: false, message: "userId and amount are required" });
        }

        const withdrawal = await withdrawalService.initiateWithdrawal(userId, Number(amount));
        return res.status(201).json({
            success: true,
            message: "Withdrawal initiated successfully",
            data: withdrawal
        });
    } catch (error) {
        next(error); // Error handler middleware ko bhejega
    }
};

const updateStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await withdrawalService.rollbackFailedWithdrawal(id, status);
        return res.status(200).json({
            success: true,
            message: `Withdrawal status updated to ${status}`,
            data: updated
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createWithdrawal, updateStatus };