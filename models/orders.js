const mongoose = require('mongoose');
const Reports = require('../models/reports');
const InventoryReports = require('../models/inventoryReports');
const CategoryReports = require('../models/categoryReport');

const OrdersSchema = new mongoose.Schema({
    invoiceNumber: String,
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
OrdersSchema.post('save', async (doc, next) => {
    // generate date Id
    const dateId = generateDateId();
    // 1. REPORTS
    await Reports.findOneAndUpdate({_id: '_GLOBAL'}, {
        $inc: {totalAmount: doc.totalAmount, totalQty: doc.totalQty}
    }, {
        new: true,
        upsert: true // Make this update into an upsert
    });
    // update date Id
    await Reports.findOneAndUpdate({_id: dateId}, {
        date: dateId,
        $inc: {totalAmount: doc.totalAmount, totalQty: doc.totalQty}
    }, {
        new: true,
        upsert: true // Make this update into an upsert
    });
    // 2. Inventory report
    for (const item of doc.items) {
        await InventoryReports.findOneAndUpdate({_id: '_GLOBAL', itemId: item._id}, {
            itemId: item._id,
            name: doc.name,
            $inc: {totalAmount: doc.totalAmount, totalQty: doc.totalQty}
        }, {
            new: true,
            upsert: true // Make this update into an upsert
        });
        // update date Id
        await InventoryReports.findOneAndUpdate({_id: dateId, itemId: item._id}, {
            date: dateId,
            itemId: item._id,
            name: doc.name,
            $inc: {totalAmount: doc.totalAmount, totalQty: doc.totalQty}
        }, {
            new: true,
            upsert: true // Make this update into an upsert
        });
    }

    // 2. Inventory categories report
    for (const item of doc.categories) {
        await CategoryReports.findOneAndUpdate({_id: '_GLOBAL', itemId: item._id}, {
            itemId: item._id,
            name: doc.name,
            $inc: {totalAmount: doc.totalAmount, totalQty: doc.totalQty}
        }, {
            new: true,
            upsert: true // Make this update into an upsert
        });
        // update date Id
        await CategoryReports.findOneAndUpdate({_id: dateId, itemId: item._id}, {
            date: dateId,
            itemId: item._id,
            name: doc.name,
            $inc: {totalAmount: doc.totalAmount, totalQty: doc.totalQty}
        }, {
            new: true,
            upsert: true // Make this update into an upsert
        });
    }

});

module.exports = mongoose.model('orders', OrdersSchema);


function generateDateId() {
    const date = new Date();
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}
