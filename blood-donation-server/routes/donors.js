const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

// Get all donors (Admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const donors = await User.find({ role: 'user' }).select('-password');
        res.json(donors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get donor by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const donor = await User.findById(req.params.id).select('-password');
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }
        res.json(donor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new donor (Admin only)
router.post('/', adminAuth, async (req, res) => {
    try {
        const { name, email, bloodType, phone, address, latitude, longitude, city, state, zipCode } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'Donor with this email already exists' });
        }

        // Create default password
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        const donor = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user',
            bloodType,
            phone,
            address,
            latitude,
            longitude,
            city,
            state,
            zipCode,
            status: 'Active'
        });

        await donor.save();
        res.status(201).json(donor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update donor
router.put('/:id', auth, async (req, res) => {
    try {
        const { name, email, bloodType, phone, address, latitude, longitude, city, state, zipCode, status } = req.body;

        // Check if user is updating their own profile or is admin
        if (req.user._id.toString() !== req.params.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const donor = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, bloodType, phone, address, latitude, longitude, city, state, zipCode, status },
            { new: true }
        ).select('-password');

        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }

        res.json(donor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete donor (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const donor = await User.findByIdAndDelete(req.params.id);
        if (!donor) {
            return res.status(404).json({ message: 'Donor not found' });
        }
        res.json({ message: 'Donor deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search donors by location and blood type
router.get('/search/location', auth, async (req, res) => {
    try {
        const { bloodType, latitude, longitude, radius = 50 } = req.query;

        let query = { role: 'user', status: 'Active' };

        if (bloodType) {
            query.bloodType = bloodType;
        }

        // Find donors with location data
        query.latitude = { $exists: true };
        query.longitude = { $exists: true };

        const donors = await User.find(query).select('-password');

        // Calculate distance and filter by radius
        if (latitude && longitude) {
            const lat = parseFloat(latitude);
            const lng = parseFloat(longitude);
            const rad = parseFloat(radius);

            const donorsWithDistance = donors.map(donor => {
                const distance = calculateDistance(lat, lng, donor.latitude, donor.longitude);
                return {
                    ...donor.toObject(),
                    distance
                };
            }).filter(donor => donor.distance <= rad);

            // Sort by distance
            donorsWithDistance.sort((a, b) => a.distance - b.distance);
            return res.json(donorsWithDistance);
        }

        res.json(donors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Helper function to calculate distance
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}

module.exports = router;
