const mongoose = require('mongoose');

const categoryReportsSchema = new mongoose.Schema({
    categoryId: String,
    name: String,
    date: String,
    totalQty: Number,
    totalAmount: Number,
}, {timestamps: true});


module.exports = mongoose.model('category-report', categoryReportsSchema);
