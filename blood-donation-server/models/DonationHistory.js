const mongoose = require('mongoose');

const donationHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    units: {
        type: Number,
        required: true,
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('DonationHistory', donationHistorySchema);
