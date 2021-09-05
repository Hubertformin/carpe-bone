const mongoose = require('mongoose');

const syncChangesSchema = new mongoose.Schema({
    name: String,
    location: String,
    country: String,
    city: String,
    currency: String
}, {timestamps: true});


module.exports = mongoose.model('sync_changes', syncChangesSchema);
