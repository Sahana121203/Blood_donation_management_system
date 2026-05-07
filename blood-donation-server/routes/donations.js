const express = require('express');
const router = express.Router();
const DonationHistory = require('../models/DonationHistory');
const { auth, adminAuth } = require('../middleware/auth');

// Get user donation history
router.get('/', auth, async (req, res) => {
    try {
        const donations = await DonationHistory.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all donations (Admin only)
router.get('/all', adminAuth, async (req, res) => {
    try {
        const donations = await DonationHistory.find().populate('userId', 'name email bloodType').sort({ createdAt: -1 });
        res.json(donations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add donation record (Admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const { userId, date, location, units } = req.body;

        const donation = new DonationHistory({
            userId,
            date,
            location,
            units
        });

        await donation.save();

        // Update user's last donation date
        const User = require('../models/User');
        await User.findByIdAndUpdate(userId, { lastDonation: new Date(date) });

        res.status(201).json(donation);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
