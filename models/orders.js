const mongoose = require('mongoose');
const Reports = require('../models/reports');
const InventoryReports = require('../models/inventoryReports');
const CategoryReports = require('../models/categoryReport');
const Functions = require('../utils/functions');

const OrdersSchema = new mongoose.Schema({
    invoiceNumber: String,
    dateId: String,
    items: Array,
    categories: Array,
    totalQty: Number,
    totalAmount: Number,
    cashier: Object
}, {timestamps: true});

/**
 * Order save hook
 * Generate reports
 * STEPS
 *  1. Update all GLOBAL documents for all reports collections to contain new
 *  2. Update current date report to new value
 *
 */
// OrdersSchema.post('save', async (doc, next) => {
//     // generate date Id
//     const dateId = Functions.generateDateId();
//     // 1. REPORTS
//     await Reports.findOneAndUpdate({ id: '_GLOBAL'}, {
//         id: '_GLOBAL',
//         $inc: {totalAmount: doc.totalAmount, numberOfOrders: 1}
//     }, {
//         new: true,
//         upsert: true // Make this update into an upsert
//     });
//     // update date Id
//     await Reports.findOneAndUpdate({id: dateId}, {
//         id: dateId,
//         date: dateId,
//         $inc: {totalAmount: doc.totalAmount, numberOfOrders: 1}
//     }, {
//         new: true,
//         upsert: true // Make this update into an upsert
//     });
//     // 2. Inventory report
//     for (const item of doc.items) {
//         await InventoryReports.findOneAndUpdate({id: '_GLOBAL', itemId: item._id}, {
//             id: '_GLOBAL',
//             itemId: item._id,
//             name: item.name,
//             $inc: {totalAmount: (item.quantity * item.unitPrice), totalQty: item.quantity}
//         }, {
//             new: true,
//             upsert: true // Make this update into an upsert
//         });
//         // update date Id
//         await InventoryReports.findOneAndUpdate({id: dateId, itemId: item._id}, {
//             id: dateId,
//             date: dateId,
//             itemId: item._id,
//             name: item.name,
//             $inc: {totalAmount: (item.quantity * item.unitPrice), totalQty: item.quantity}
//         }, {
//             new: true,
//             upsert: true // Make this update into an upsert
//         });
//     }

//     // 2. Inventory categories report
//     for (const item of doc.categories) {
//         await CategoryReports.findOneAndUpdate({id: '_GLOBAL', name: item.name}, {
//             id: '_GLOBAL',
//             name: item.name,
//             $inc: {totalAmount: item.totalAmount, totalQty: item.totalQty}
//         }, {
//             new: true,
//             upsert: true // Make this update into an upsert
//         });
//         // update date Id
//         await CategoryReports.findOneAndUpdate({id: dateId, name: item.name}, {
//             id: dateId,
//             date: dateId,
//             name: item.name,
//             $inc: {totalAmount: item.totalAmount, totalQty: item.totalQty}
//         }, {
//             new: true,
//             upsert: true // Make this update into an upsert
//         });
//     }

// });

module.exports = mongoose.model('orders', OrdersSchema);
