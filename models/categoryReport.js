const mongoose = require('mongoose');

const categoryReportsSchema = new mongoose.Schema({
    categoryId: String,
    id: String,
    name: String,
    date: String,
    totalQty: Number,
    totalAmount: Number,
}, {timestamps: true});


module.exports = mongoose.model('category_reports', categoryReportsSchema);
