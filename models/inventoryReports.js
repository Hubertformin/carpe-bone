const mongoose = require('mongoose');

const ItemsReportsSchema = new mongoose.Schema({
    id: String,
    itemId: String,
    name: String,
    date: String,
    totalQty: Number,
    totalAmount: Number,
}, {timestamps: true});


module.exports = mongoose.model('inventory-report', ItemsReportsSchema);
