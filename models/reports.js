const mongoose = require('mongoose');

const reports = new mongoose.Schema({
    id: String,
    date: String,
    totalQty: Number,
    totalAmount: Number,
    dailyOrders: Number,
}, {timestamps: true});


module.exports = mongoose.model('reports', reports);
