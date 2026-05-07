const express = require('express');
const router = express.Router();
const DonationRequest = require('../models/DonationRequest');
const Inventory = require('../models/Inventory');
const { auth, adminAuth } = require('../middleware/auth');

// Get all donation requests (Admin only)
router.get('/', adminAuth, async (req, res) => {
    try {
        const requests = await DonationRequest.find().sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create donation request
router.post('/', auth, async (req, res) => {
    try {

        const { patientName, bloodType, units, hospital, urgency } = req.body;

        // Check inventory BEFORE creating request
        const inventory = await Inventory.findOne({ hospital, bloodType });
        if (!inventory || inventory.units < units) {
            return res.status(400).json({ 
                message: `Insufficient inventory at ${hospital}. Available: ${inventory ? inventory.units : 0} units.` 
            });
        }

        const request = new DonationRequest({
            patientName,
            bloodType,
            units,
            hospital,
            urgency,
            status: 'Pending'
        });

        await request.save();
        res.status(201).json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update request status (Admin only)
router.put('/:id', adminAuth, async (req, res) => {
    try {
        const { status } = req.body;

        const request = await DonationRequest.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        // Only handle status changes to "Approved"
        if (status === 'Approved' && request.status !== 'Approved') {
            const inventory = await Inventory.findOne({ 
                hospital: request.hospital, 
                bloodType: request.bloodType 
            });

            if (!inventory || inventory.units < request.units) {
                return res.status(400).json({ 
                    message: `Cannot approve. Insufficient inventory at ${request.hospital}. Available: ${inventory ? inventory.units : 0} units.` 
                });
            }

            // Deduct from inventory
            inventory.units -= request.units;
            await inventory.save();
        }

        request.status = status;
        await request.save();

        res.json(request);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete request (Admin only)
router.delete('/:id', adminAuth, async (req, res) => {
    try {
        const request = await DonationRequest.findByIdAndDelete(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }
        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
