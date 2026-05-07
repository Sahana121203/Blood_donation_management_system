const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { auth, adminAuth } = require('../middleware/auth');

// Get blood inventory
// router.get('/', auth, async (req, res) => {
//     try {
//         const { hospital } = req.query;
//         let query = {};
//         if (hospital) {
//             query.hospital = hospital;
//         }

//         let inventory = await Inventory.find(query).sort({ bloodType: 1 });

//         // Auto-initialize if hospital specific query returns empty (for demo)
//         if (hospital && inventory.length === 0) {
//             const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
//             const newInventory = [];
            
//             for (const type of bloodTypes) {
//                 // Random units between 0 and 20
//                 const units = Math.floor(Math.random() * 21);
//                 const item = new Inventory({
//                     bloodType: type,
//                     units: units,
//                     hospital: hospital
//                 });
//                 await item.save();
//                 newInventory.push(item);
//             }
//             inventory = newInventory.sort((a, b) => a.bloodType.localeCompare(b.bloodType));
//         }

//         res.json(inventory);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

router.get('/', auth, async (req, res) => {
    try {
        const { hospital } = req.query;

        const query = hospital ? { hospital } : {};
        const inventory = await Inventory.find(query).sort({ bloodType: 1 });

        res.json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Update inventory units (Admin only)
// router.put('/:bloodType', adminAuth, async (req, res) => {
//     try {
//         const { units, hospital } = req.body;
//         const { bloodType } = req.params;

//         if (!hospital) {
//             return res.status(400).json({ message: 'Hospital is required' });
//         }

//         let inventory = await Inventory.findOne({ bloodType, hospital });

//         if (!inventory) {
//             inventory = new Inventory({ bloodType, units, hospital });
//             await inventory.save();
//         } else {
//             inventory.units = units;
//             await inventory.save();
//         }

//         res.json(inventory);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

router.get('/', auth, async (req, res) => {
    try {
        const { hospital } = req.query;

        const query = hospital ? { hospital } : {};
        const inventory = await Inventory.find(query).sort({ bloodType: 1 });

        res.json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Initialize inventory (Admin only)
// router.post('/initialize', adminAuth, async (req, res) => {
//     try {
//         const { hospital } = req.body;
//         const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

//         if (!hospital) {
//             return res.status(400).json({ message: 'Hospital is required' });
//         }

//         for (const bloodType of bloodTypes) {
//             const exists = await Inventory.findOne({ bloodType, hospital });
//             if (!exists) {
//                 await Inventory.create({ bloodType, units: 0, hospital });
//             }
//         }

//         const inventory = await Inventory.find({ hospital }).sort({ bloodType: 1 });
//         res.json(inventory);
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server error' });
//     }
// });.
router.post('/initialize', adminAuth, async (req, res) => {
    try {
        const { hospital } = req.body;

        if (!hospital) {
            return res.status(400).json({ message: 'Hospital is required' });
        }

        const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

        const operations = bloodTypes.map(bloodType => ({
            updateOne: {
                filter: { hospital, bloodType },
                update: { $setOnInsert: { units: 0 } },
                upsert: true
            }
        }));

        await Inventory.bulkWrite(operations);

        const inventory = await Inventory.find({ hospital }).sort({ bloodType: 1 });
        res.json(inventory);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
