const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    regimentalNo: { type: String, required: true },
    name: { type: String, required: true },
    paradeName: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', AttendanceSchema);