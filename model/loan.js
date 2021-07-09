const mongoose = require("mongoose");

const loanSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    loan_type: { type: String, default: null },
    amount: { type: String, default: null },
    payment_period: { type: String, unique: true },
});

module.exports = mongoose.model("loan", loanSchema);
