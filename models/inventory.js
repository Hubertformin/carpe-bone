const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    name: String,
    category: String,
    unitPrice: Number,
    quantity: Number,
    photoURL: String
}, {timestamps: true});

module.exports = mongoose.model('inventory_items', InventorySchema);
