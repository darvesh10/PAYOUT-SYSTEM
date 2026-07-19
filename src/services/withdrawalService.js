const prisma = require("../config/prisma");

const initiateWithdrawal = async (userId, amount) => {
    return await prisma.$transaction(async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User parameters not found");

        if (Number(user.withdrawableBalance) < amount) {
            throw new Error("Insufficient balance for withdrawal request");
        }

        // Rule 3: 24 hour limitation tracking[cite: 8]
        if (user.lastWithdrawalAt) {
            const timeDifference = (new Date() - new Date(user.lastWithdrawalAt)) / (1000 * 60 * 60);
            if (timeDifference < 24) {
                throw new Error("Withdrawal allowed once in every 24 hours boundary.");
            }
        }

        // Deduct balance and adjust time flags
        await tx.user.update({
            where: { id: userId },
            data: {
                withdrawableBalance: { decrement: amount },
                lastWithdrawalAt: new Date()
            }
        });

        return await tx.withdrawal.create({
            data: { userId, amount, status: "PENDING" }
        });
    });
};

// Question 2: Recovery workflow implementation[cite: 8]
const rollbackFailedWithdrawal = async (withdrawalId, executionStatus) => {
    if (!["FAILED", "CANCELLED", "REJECTED"].includes(executionStatus)) {
        throw new Error("Invalid terminal execution status.");
    }

    return await prisma.$transaction(async (tx) => {
        const withdrawal = await tx.withdrawal.findUnique({ where: { id: withdrawalId } });
        if (!withdrawal) throw new Error("Withdrawal log sheet not found");
        if (withdrawal.status !== "PENDING") throw new Error("Transaction state already captured");

        // Set state to terminal status
        const finalizedWithdrawal = await tx.withdrawal.update({
            where: { id: withdrawalId },
            data: { status: executionStatus }
        });

        // Add funds back into user balance and reset withdrawal block rule[cite: 8]
        await tx.user.update({
            where: { id: withdrawal.userId },
            data: {
                withdrawableBalance: { increment: withdrawal.amount },
                lastWithdrawalAt: null 
            }
        });

        return finalizedWithdrawal;
    });
};

module.exports = {
    initiateWithdrawal,
    rollbackFailedWithdrawal
};