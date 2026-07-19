const payoutService = require("../services/payoutService");

const triggerAdvancePayouts = async (req, res, next) => {
    try {
        const result = await payoutService.processAdvancePayouts();
        return res.status(200).json({
            success: true,
            message: "Advance payouts processed successfully",
            count: result.length,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { triggerAdvancePayouts };