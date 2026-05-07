const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    bloodType: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    units: {
        type: Number,
        required: true,
        default: 0
    },
    hospital: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Compound unique index: each hospital can have one entry per blood type
inventorySchema.index({ hospital: 1, bloodType: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
