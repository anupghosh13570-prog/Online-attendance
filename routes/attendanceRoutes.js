const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const ParadeSession = require('../Models/ParadeSession');

// 1. Get Comprehensive Cadet Dashboard Stats (Fixed counts and percentage)
router.get('/dashboard/:regNo', async (req, res) => {
    try {
        const regNo = req.params.regNo;
        const cadet = await User.findOne({ regimentalNo: regNo });
        if (!cadet) {
            return res.status(404).json({ msg: 'Cadet not found' });
        }

        const attendanceRecords = await Attendance.find({ regimentalNo: regNo }).sort({ timestamp: -1 });
        
        // Count unique parades conducted across system
        const uniqueParades = await Attendance.distinct('paradeName');
        const totalParadesConducted = Math.max(uniqueParades.length, attendanceRecords.length, 1);

        res.json({
            cadet,
            attendanceRecords,
            totalAttended: attendanceRecords.length,
            totalParadesConducted
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 2. SUO: Start a new timed parade session (15 minutes window)
router.post('/suo/start-session', async (req, res) => {
    try {
        const { paradeName, suoRegNo } = req.body;
        if (!paradeName) {
            return res.status(400).json({ msg: 'Parade name is required' });
        }
        
        // Close any existing active sessions
        await ParadeSession.updateMany({ isActive: true }, { isActive: false });

        // Set expiry time to exactly 15 minutes from now
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        const newSession = new ParadeSession({
            paradeName: paradeName.trim().toUpperCase(),
            suoRegNo: suoRegNo || 'SUO',
            expiresAt,
            isActive: true
        });

        await newSession.save();
        res.status(201).json({ msg: 'Parade session started successfully for 15 minutes!', expiresAt });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 3. Cadet: Mark attendance only if 15-min session is active
router.post('/cadet/mark-timed', async (req, res) => {
    try {
        const { regimentalNo, paradeName } = req.body;
        const cleanedParadeName = paradeName.trim().toUpperCase();

        // Check if session is active and valid
        const session = await ParadeSession.findOne({ 
            paradeName: cleanedParadeName, 
            isActive: true 
        });

        if (!session) {
            return res.status(400).json({ msg: 'No active parade session found with this code/name!' });
        }

        // Check if 15 mins time expired
        if (new Date() > new Date(session.expiresAt)) {
            session.isActive = false;
            await session.save();
            return res.status(400).json({ msg: 'Attendance window closed! 15 minutes time expired.' });
        }

        // Check if already marked
        const existing = await Attendance.findOne({ regimentalNo, paradeName: cleanedParadeName });
        if (existing) {
            return res.status(400).json({ msg: 'Attendance already marked for this parade.' });
        }

        const attendance = new Attendance({
            regimentalNo,
            paradeName: cleanedParadeName,
            status: 'Present',
            timestamp: new Date()
        });

        await attendance.save();
        res.status(201).json({ msg: 'Attendance recorded successfully!' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// 4. SUO/Admin Manual Mark or Update Attendance
router.post('/suo/mark', async (req, res) => {
    try {
        const { regimentalNo, paradeName, status } = req.body;
        const cleanedParadeName = paradeName.trim().toUpperCase();
        
        const cadet = await User.findOne({ regimentalNo });
        if (!cadet) {
            return res.status(404).json({ msg: 'Cadet not found' });
        }

        let attendance = await Attendance.findOne({ 
            regimentalNo, 
            paradeName: cleanedParadeName 
        });

        if (attendance) {
            attendance.status = status || 'Present';
            await attendance.save();
            return res.json({ msg: 'Attendance updated successfully by SUO' });
        }

        const newAttendance = new Attendance({
            regimentalNo,
            paradeName: cleanedParadeName,
            status: status || 'Present',
            timestamp: new Date()
        });

        await newAttendance.save();
        res.status(201).json({ msg: 'Attendance marked successfully by SUO' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;