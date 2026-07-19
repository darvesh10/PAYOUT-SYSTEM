const saleService = require("../services/saleService");

const createSale = async (req, res, next) => {
    try {
        const sale = await saleService.createSale(req.body);
        return res.status(201).json({
            success: true,
            message: "Sale created successfully",
            data: sale
        });
    } catch (error) {
        next(error);
    }
};

const reconcile = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updatedSale = await saleService.reconcileSale(id, status);
        return res.status(200).json({
            success: true,
            message: `Sale successfully ${status.toLowerCase()}`,
            data: updatedSale
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { createSale, reconcile };