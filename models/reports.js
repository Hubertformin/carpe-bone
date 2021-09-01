const mongoose = require('mongoose');

const reports = new mongoose.Schema({
    dateId: String,
    date: String,
    totalQty: Number,
    totalAmount: Number,
    numberOfOrders: Number,
    dailyOrders: Number,
}, {timestamps: true});


module.exports = mongoose.model('reports', reports);
