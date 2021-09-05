const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
    photoURL: String,
    password: String,
    role: String
}, {timestamps: true});

module.exports = mongoose.model('users', UserSchema);
