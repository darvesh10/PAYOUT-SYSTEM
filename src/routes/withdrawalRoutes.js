const express = require("express");
const router = express.Router();
const withdrawalController = require("../controllers/withdrawalController");

router.post("/", withdrawalController.createWithdrawal);
router.patch("/:id/status", withdrawalController.updateStatus); // Failed recovery trigger API

module.exports = router;