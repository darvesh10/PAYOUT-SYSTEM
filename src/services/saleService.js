const saleRepository = require("../repositories/saleRepository");
const prisma = require("../config/prisma");

const createSale = async (body) => {
    return await saleRepository.createSale({
        userId: body.userId,
        brandId: body.brandId,
        earning: body.earning.toString()
    });
};

const reconcileSale = async (saleId, status) => {
    if (!["APPROVED", "REJECTED"].includes(status)) {
        throw new Error("Invalid reconciliation status. Must be APPROVED or REJECTED.");
    }

    const sale = await saleRepository.findSaleById(saleId);
    if (!sale) throw new Error("Sale record not found");
    if (sale.status !== "PENDING") throw new Error("Sale is already reconciled");

    const earning = Number(sale.earning);
    const advanceAmount = Number(sale.advanceAmount);

    return await prisma.$transaction(async (tx) => {
        let updatedSale;
        
        if (status === "APPROVED") {
            const finalAmount = earning - advanceAmount;

            updatedSale = await tx.sale.update({
                where: { id: saleId },
                data: { status: "APPROVED" },
            });

            await tx.payout.create({
                data: {
                    saleId: sale.id,
                    userId: sale.userId,
                    type: "FINAL",
                    amount: finalAmount,
                    status: "SUCCESS"
                }
            });

            await tx.user.update({
                where: { id: sale.userId },
                data: { withdrawableBalance: { increment: finalAmount } }
            });

        } else if (status === "REJECTED") {
            // Balance calculation explicitly using decrement abstraction for strict type update
            updatedSale = await tx.sale.update({
                where: { id: saleId },
                data: { status: "REJECTED" },
            });

            await tx.payout.create({
                data: {
                    saleId: sale.id,
                    userId: sale.userId,
                    type: "ADJUSTMENT",
                    amount: -advanceAmount,
                    status: "SUCCESS"
                }
            });

            await tx.user.update({
                where: { id: sale.userId },
                data: { withdrawableBalance: { decrement: advanceAmount } }
            });
        }

        return updatedSale;
    }, {
        timeout: 10000 // Connection timeout extend kiya taaki loop lock na ho
    });
};

module.exports = {
    createSale,
    reconcileSale
};