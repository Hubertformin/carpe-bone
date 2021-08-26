const mongoose = require('mongoose');

const InventoryCategorySchema = new mongoose.Schema({
    name: {
      type: String,
      unique: true
    },
    numberOfItems: Number
}, {timestamps: true});

module.exports = mongoose.model('inventoryCategory', InventoryCategorySchema);
