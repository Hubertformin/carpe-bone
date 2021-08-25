const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
    name: String,
    category: String,
    unitPrice: String,
    quantity: Number,
    photoURL: String
}, {timestamps: true});

module.exports = mongoose.model('Inventory', InventorySchema);
