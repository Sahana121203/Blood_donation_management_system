const nodemailer = require('nodemailer');

// For testing, you can use Ethereal Email or a test Gmail account
// WARNING: In production, these should be in .env

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER ,
    pass: process.env.EMAIL_PASS 
  }
});

const sendEmailToAllUsers = async (users, campaign) => {
  if (!users || users.length === 0) return;

  const emailPromises = users.map(user => {
    const mailOptions = {
      from: '"Blood Donation App" <noreply@blooddonation.com>',
      to: user.email,
      subject: `New Campaign: ${campaign.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #d32f2f;">New Blood Donation Campaign!</h2>
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>An new blood donation campaign has been scheduled:</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">${campaign.title}</h3>
            <p><strong>Description:</strong> ${campaign.description}</p>
            <p><strong>Location:</strong> ${campaign.location}</p>
            <p><strong>Address:</strong> ${campaign.address}</p>
          </div>
          <p>Your contribution can save lives. Please consider participating!</p>
          <p>Best regards,<br>The Blood Donation Team</p>
        </div>
      `
    };

    return transporter.sendMail(mailOptions).catch(err => {
      console.error(`Failed to send email to ${user.email}:`, err);
    });
  });

  await Promise.all(emailPromises);
};

module.exports = {
  sendEmailToAllUsers
};
