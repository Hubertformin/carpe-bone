const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: String,
    location: String,
    country: String,
    city: String,
    currency: String
}, {timestamps: true});


module.exports = mongoose.model('company', companySchema);
