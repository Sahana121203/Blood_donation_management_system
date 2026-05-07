const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { sendOTP } = require('../utils/mailer');
const crypto = require('crypto');

// Register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role, bloodType, phone, address } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Create user
        user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            bloodType,
            phone,
            address,
            otp,
            otpExpires,
            isVerified: false
        });

        await user.save();

        // Send OTP
        try {
            await sendOTP(email, otp);
        } catch (error) {
            console.error('Failed to send OTP during registration:', error);
            // We still save the user, but inform them or handle it
        }

        res.status(201).json({
            message: 'Registration successful. Please check your email for verification OTP.',
            email: user.email
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if verified
        if (!user.isVerified) {
            return res.status(401).json({ message: 'Please verify your email address first', email: user.email });
        }

        // Check role
        if (role && user.role !== role) {
            return res.status(400).json({ message: 'Invalid credentials for this role' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bloodType: user.bloodType,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user
router.get('/me', auth, async (req, res) => {
    try {
        res.json({
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            role: req.user.role,
            bloodType: req.user.bloodType,
            phone: req.user.phone,
            address: req.user.address,
            latitude: req.user.latitude,
            longitude: req.user.longitude
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, email, bloodType, phone, address, latitude, longitude } = req.body;

        // Build user object
        const userFields = {};
        if (name) userFields.name = name;
        if (email) userFields.email = email;
        if (bloodType) userFields.bloodType = bloodType;
        if (phone) userFields.phone = phone;
        if (address) userFields.address = address;
        if (latitude) userFields.latitude = latitude;
        if (longitude) userFields.longitude = longitude;

        // Check if email is being changed and if it already exists
        if (email && email !== req.user.email) {
            let user = await User.findOne({ email });
            if (user) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $set: userFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // Create token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bloodType: user.bloodType,
                phone: user.phone,
                address: user.address
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOTP(email, otp);

        res.json({ message: 'New OTP sent to your email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
