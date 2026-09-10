const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register Route (Secured with Password Hashing)
router.post('/register', async (req, res) => {
    try {
        const { name, regimentalNo, password, role, batchYear } = req.body;
        let user = await User.findOne({ regimentalNo });
        
        if (user) {
            return res.status(400).json({ msg: 'Cadet with this Regimental No already exists!' });
        }

        // Hash password before saving
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ 
            name, 
            regimentalNo, 
            password: hashedPassword, // Save hashed password
            role: role || 'Cadet', 
            batchYear 
        });

        await user.save();
        res.status(201).json({ msg: 'Registered successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login Route (Secured with Password Verification)
router.post('/login', async (req, res) => {
    try {
        const { regimentalNo, password } = req.body;
        const user = await User.findOne({ regimentalNo });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid Regimental Number or Password' });
        }

        // Check password (supports legacy plain text or hashed passwords)
        let isMatch = false;
        if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
            isMatch = await bcrypt.compare(password, user.password);
        } else {
            // Fallback for old plain-text passwords in database
            isMatch = (user.password === password);
        }

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Regimental Number or Password' });
        }

        res.json({
            msg: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                regimentalNo: user.regimentalNo,
                role: user.role,
                batchYear: user.batchYear
            }
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;