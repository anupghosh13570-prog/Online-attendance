const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    regimentalNo: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    batchYear: {
        type: Number,
        required: true,
        default: 2026
    },
    role: {
        type: String,
        default: 'Cadet'
    }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);
module.exports = User;