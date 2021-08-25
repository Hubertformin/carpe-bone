const mongoose = require('mongoose');

const InventoryCategorySchema = new mongoose.Schema({
    name: String,
    numberOfItems: Number
}, {timestamps: true});

module.exports = mongoose.model('inventoryCategory', InventoryCategorySchema);
