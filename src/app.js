const express = require("express");
const app = express();
const PORT = 3000;

const saleRoutes = require("./routes/saleRoutes");
const payoutRoutes = require("./routes/payoutRoutes");
const withdrawalRoutes = require("./routes/withdrawalRoutes");
const errorHandler = require("./middlewares/errorHandler");

app.use(express.json());

// Routes Mount
app.use("/sales", saleRoutes);
app.use("/payouts", payoutRoutes);
app.use("/withdrawals", withdrawalRoutes);

// Central Error Handler Layer
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});