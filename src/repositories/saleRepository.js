const prisma = require("../config/prisma");

const createSale = async (saleData) => {
    return await prisma.sale.create({
        data: saleData,
    });
};

const findSaleById = async (id, tx) => {
    const client = tx || prisma;
    return await client.sale.findUnique({ where: { id } });
};

const findPendingSalesForAdvance = async (tx) => {
    const client = tx || prisma;
    return await client.sale.findMany({
        where: { status: "PENDING", advancePaid: false }
    });
};

const updateSaleStatusAndAdvance = async (id, updateData, tx) => {
    const client = tx || prisma;
    return await client.sale.update({
        where: { id },
        data: updateData
    });
};

module.exports = {
    createSale,
    findSaleById,
    findPendingSalesForAdvance,
    updateSaleStatusAndAdvance
};