const saleRepository = require("../repositories/saleRepository");
const prisma = require("../config/prisma");

const processAdvancePayouts = async () => {
    return await prisma.$transaction(async (tx) => {
        const eligibleSales = await saleRepository.findPendingSalesForAdvance(tx);
        const processed = [];

        for (const sale of eligibleSales) {
            // Rule 1: Calculate 10% advance payout[cite: 8]
            const calculatedAdvance = Number(sale.earning) * 0.10;

            // Payout history table creation
            const payout = await tx.payout.create({
                data: {
                    saleId: sale.id,
                    userId: sale.userId,
                    type: "ADVANCE",
                    amount: calculatedAdvance,
                    status: "SUCCESS"
                }
            });

            // Mark advance flags on sale record to guarantee idempotency[cite: 8]
            await saleRepository.updateSaleStatusAndAdvance(sale.id, {
                advancePaid: true,
                advanceAmount: calculatedAdvance
            }, tx);

            // Increment User Balance immediately
            await tx.user.update({
                where: { id: sale.userId },
                data: {
                    withdrawableBalance: { increment: calculatedAdvance }
                }
            });

            processed.push(payout);
        }

        return processed;
    });
};

// const processAdvancePayouts = async () => {
//     const eligibleSales = await saleRepository.findPendingSalesForAdvance();

//     console.log(eligibleSales);

//     return eligibleSales;
// };

module.exports = {
    processAdvancePayouts
};