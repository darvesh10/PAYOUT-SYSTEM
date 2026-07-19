const express = require("express");
const router = express.Router();
const payoutController = require("../controllers/payoutController");

router.post("/advance", payoutController.triggerAdvancePayouts);

module.exports = router;