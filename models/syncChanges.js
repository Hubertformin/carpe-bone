const mongoose = require('mongoose');

const syncChangesSchema = new mongoose.Schema({
    rev: Number,
    source: String,
    type: Number,
    table: String,
    key: String,
    mods: Object,
    obj: Object
}, {timestamps: true});


module.exports = mongoose.model('sync_changes', syncChangesSchema);
