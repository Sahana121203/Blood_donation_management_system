const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { sendEmailToAllUsers } = require('../utils/emailService');

// Get all campaigns
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create a campaign
router.post('/', async (req, res) => {
  const { title, description, location, address } = req.body;

  const campaign = new Campaign({
    title,
    description,
    location,
    address
  });

  try {
    const newCampaign = await campaign.save();

    // Create a notification for all users
    const notification = new Notification({
      title: `New Campaign: ${title}`,
      message: `A new campaign has been created at ${location}. ${description}`,
      type: 'campaign',
      targetUser: null // For all users
    });
    await notification.save();

    // Send emails to all users
    try {
      const users = await User.find({}, 'email name');
      // We don't await here to not block the response, or we can await if we want to ensure it's sent
      sendEmailToAllUsers(users, newCampaign);
    } catch (emailErr) {
      console.error('Error fetching users for email:', emailErr);
    }

    res.status(201).json(newCampaign);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
