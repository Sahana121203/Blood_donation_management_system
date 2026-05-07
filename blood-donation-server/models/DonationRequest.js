const mongoose = require('mongoose');

const donationRequestSchema = new mongoose.Schema({
    patientName: {
        type: String,
        required: true
    },
    bloodType: {
        type: String,
        required: true,
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    },
    units: {
        type: Number,
        required: true
    },
    hospital: {
        type: String,
        required: true
    },
    urgency: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'Fulfilled'],
        default: 'Pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DonationRequest', donationRequestSchema);
