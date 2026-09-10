const mongoose = require('mongoose');

const ParadeSessionSchema = new mongoose.Schema({
    paradeName: { type: String, required: true },
    suoRegNo: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ParadeSession', ParadeSessionSchema);