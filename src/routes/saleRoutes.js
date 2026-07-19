const express = require("express");
const router = express.Router();
const saleController = require("../controllers/saleController");

router.post("/", saleController.createSale);
router.patch("/reconcile/:id", saleController.reconcile); // Admin reconciliation API

module.exports = router;