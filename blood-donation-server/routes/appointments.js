const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Inventory = require('../models/Inventory');
const { auth, adminAuth } = require('../middleware/auth');

// Get user appointments
router.get('/', auth, async (req, res) => {
    try {
        const appointments = await Appointment.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all appointments (Admin only)
router.get('/all', adminAuth, async (req, res) => {
    try {
        const appointments = await Appointment.find().populate('userId', 'name email bloodType').sort({ createdAt: -1 });
        res.json(appointments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get unique hospitals from appointments (Admin only)
router.get('/hospitals', adminAuth, async (req, res) => {
    try {
        const appointments = await Appointment.find().select('location.hospital');
        const uniqueHospitals = [...new Set(appointments.map(app => app.location.hospital))].sort();
        res.json(uniqueHospitals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Schedule appointment
router.post('/', auth, async (req, res) => {
    try {
        const { date, time, location } = req.body;

        const appointment = new Appointment({
            userId: req.user._id,
            date,
            time,
            location,
            status: 'Pending'
        });

        await appointment.save();
        res.status(201).json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update appointment status
router.put('/:id', auth, async (req, res) => {
    try {
        const { status, unitsDonated } = req.body;

        const appointment = await Appointment.findById(req.params.id).populate('userId', 'name email bloodType');
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user owns the appointment or is admin
        if (!appointment.userId) {
            return res.status(400).json({ message: 'User associated with this appointment not found' });
        }

        const appointmentUserId = appointment.userId._id || appointment.userId;
        if (appointmentUserId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // If status is being changed to "Completed", create donation history
        if (status === 'Completed' && appointment.status !== 'Completed') {
            if (!unitsDonated || unitsDonated <= 0) {
                return res.status(400).json({ message: 'Units donated is required when completing an appointment' });
            }

            // Create donation history record
            const DonationHistory = require('../models/DonationHistory');
            const donationRecord = new DonationHistory({
                userId: appointmentUserId,
                date: appointment.date,
                location: `${appointment.location.hospital}, ${appointment.location.city}`,
                units: unitsDonated
            });
            await donationRecord.save();

            // Update user's last donation date
            const User = require('../models/User');
            await User.findByIdAndUpdate(appointmentUserId, {
                lastDonation: new Date()
            });

            // Store units donated in appointment
            appointment.unitsDonated = unitsDonated;

            // Update inventory
            const hospital = appointment.location.hospital;
            const bloodType = appointment.userId.bloodType;

            if (hospital && bloodType) {
                await Inventory.findOneAndUpdate(
                    { hospital, bloodType },
                    { $inc: { units: unitsDonated } },
                    { upsert: true, new: true }
                );
            }
        }

        appointment.status = status;
        await appointment.save();
        res.json(appointment);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Cancel appointment
router.delete('/:id', auth, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        // Check if user owns the appointment or is admin
        if (appointment.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }

        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Appointment cancelled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
