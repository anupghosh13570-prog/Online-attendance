const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const XLSX = require('xlsx');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/ncc_portal')
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.log(err));

const otpStore = {};

// ================= SCHEMA =================
const cadetSchema = new mongoose.Schema({
    regimentalNo: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    mobileNo: { type: String, required: true },
    batch: { type: String, default: '1st Year' }, // Direct manual batch control ('1st Year', '2nd Year', '3rd Year')
    password: { type: String, required: true },
    role: { type: String, default: 'Cadet' },
    status: { type: String, enum: ['Pending', 'Approved'], default: 'Pending' },
    attendanceHistory: [
        {
            date: { type: Date, default: Date.now },
            paradeCode: { type: String },
            status: { type: String, default: 'Present' }
        }
    ]
});
const Cadet = mongoose.model('Cadet', cadetSchema);

const paradeSessionSchema = new mongoose.Schema({
    paradeName: { type: String, required: true },
    suoRegNo: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, required: true }
});
const ParadeSession = mongoose.model('ParadeSession', paradeSessionSchema);


// ================= APIs =================

app.post('/api/auth/send-otp', (req, res) => {
    const { mobileNo } = req.body;
    if (!mobileNo || mobileNo.length < 10) return res.status(400).json({ msg: 'Invalid mobile number' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[mobileNo] = otp;
    res.status(200).json({ msg: 'OTP sent!', mockOtp: otp });
});

app.post('/api/register', async (req, res) => {
    try {
        const { regimentalNo, name, fatherName, mobileNo, password, otp } = req.body;
        if (otpStore[mobileNo] !== otp) return res.status(400).json({ msg: 'Invalid OTP!' });

        const existing = await Cadet.findOne({ regimentalNo });
        if (existing) return res.status(400).json({ msg: 'Regimental No already registered!' });

        // Naya cadet hamesha default '1st Year' se register hoga, baad me SUO change karega
        const newCadet = new Cadet({ 
            regimentalNo, 
            name, 
            fatherName, 
            mobileNo, 
            batch: '1st Year', 
            password, 
            status: 'Pending' 
        });
        
        await newCadet.save();
        delete otpStore[mobileNo];
        res.status(201).json({ msg: 'Registration submitted successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { regimentalNo, password, mobileNo, otp } = req.body;
        if (regimentalNo === 'SUO001' && password === 'admin123') {
            return res.json({ user: { name: 'SUO Admin', regimentalNo: 'SUO001', role: 'SUO', batch: 'Admin' } });
        }

        let cadet;
        if (otp) {
            if (otpStore[mobileNo] !== otp) return res.status(400).json({ msg: 'Invalid OTP!' });
            cadet = await Cadet.findOne({ mobileNo });
            delete otpStore[mobileNo];
        } else {
            cadet = await Cadet.findOne({ regimentalNo, password });
        }

        if (!cadet || cadet.status !== 'Approved') return res.status(400).json({ msg: 'Invalid credentials or pending approval.' });

        res.json({ user: cadet });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/cadets', async (req, res) => {
    try {
        const cadets = await Cadet.find();
        res.json(cadets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/cadet/approve/:id', async (req, res) => {
    try {
        const cadet = await Cadet.findByIdAndUpdate(req.params.id, { status: 'Approved' }, { new: true });
        res.json({ msg: 'Approved successfully', cadet });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SUO Batch Update API (1 click batch change)
app.put('/api/cadet/update-batch/:id', async (req, res) => {
    try {
        const { batch } = req.body;
        const cadet = await Cadet.findByIdAndUpdate(req.params.id, { batch }, { new: true });
        res.json({ msg: 'Batch updated successfully', cadet });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/attendance/suo/start-session', async (req, res) => {
    try {
        const { paradeName, suoRegNo } = req.body;
        await ParadeSession.updateMany({ isActive: true }, { isActive: false });
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        const newSession = new ParadeSession({ paradeName: paradeName.trim().toUpperCase(), suoRegNo, expiresAt, isActive: true });
        await newSession.save();
        res.status(201).json({ msg: '15-Minute Attendance Window Started!', expiresAt });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/attendance/cadet/mark-timed', async (req, res) => {
    try {
        const { regimentalNo, paradeName } = req.body;
        const cleanedCode = paradeName.trim().toUpperCase();
        const session = await ParadeSession.findOne({ paradeName: cleanedCode, isActive: true });

        if (!session || new Date() > new Date(session.expiresAt)) {
            return res.status(400).json({ msg: 'Invalid or expired parade code session!' });
        }

        const cadet = await Cadet.findOne({ regimentalNo });
        if (!cadet) return res.status(404).json({ msg: 'Cadet not found' });

        if (cadet.attendanceHistory.some(a => a.paradeCode === cleanedCode)) {
            return res.status(400).json({ msg: 'Attendance already marked.' });
        }

        cadet.attendanceHistory.push({ paradeCode: cleanedCode, status: 'Present' });
        await cadet.save();
        res.status(200).json({ msg: 'Attendance marked successfully!' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/export-attendance', async (req, res) => {
    try {
        const cadets = await Cadet.find({ status: 'Approved' });
        const excelData = cadets.map(cadet => ({
            "Regimental No": cadet.regimentalNo,
            "Name": cadet.name,
            "Father's Name": cadet.fatherName,
            "Mobile No": cadet.mobileNo,
            "Batch / Year": cadet.batch,
            "Total Classes Attended": cadet.attendanceHistory.length
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Attendance");
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename="NCC_Monthly_Attendance.xlsx"');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(5000, () => console.log('Server running on port 5000'));