const mongoose = require('mongoose');

const ItemsReportsSchema = new mongoose.Schema({
    itemId: String,
    name: String,
    date: String,
    totalQty: Number,
    totalAmount: Number,
}, {timestamps: true});


module.exports = mongoose.model('items-report', ItemsReportsSchema);
