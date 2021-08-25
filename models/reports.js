const mongoose = require('mongoose');

const reports = new mongoose.Schema({
    date: String,
    totalQty: Number,
    totalAmount: Number,
    dailyOrders: Number,
}, {timestamps: true});


module.exports = mongoose.model('category-report', reports);
