const nodemailer = require('nodemailer');

// Create transporter for Zoho
const transporter = nodemailer.createTransport({
  host: 'smtp.zoho.in',
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD
  }
});

transporter.verify(function(error, success) {
  if (error) {
    console.log("SMTP Verification Error:", error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

const emailController = {
  async sendEmail(req, res) {
    try {
      const { firstName, lastName, email, message } = req.body;

      // Validate input
      if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please fill all fields' 
        });
      }

      await transporter.sendMail({
        from: process.env.ZOHO_EMAIL,
        to: process.env.ZOHO_EMAIL,
        subject: `Message from ${firstName} ${lastName}`,
        html: `
          <h2>New Message</h2>
          <p><strong>From:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        `
      });

      res.status(200).json({
        success: true,
        message: 'Message sent successfully'
      });
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  },

  async sendRegistrationEmail(req, res) {
    try {
      const { firstName, lastName, email } = req.body;

      await transporter.sendMail({
        from: process.env.ZOHO_EMAIL,
        to: process.env.ZOHO_EMAIL,
        subject: `New User Registration - ${firstName} ${lastName}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>New User Registration</h2>
            <p><strong>First Name:</strong> ${firstName}</p>
            <p><strong>Last Name:</strong> ${lastName}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Registration Time:</strong> ${new Date().toLocaleString()}</p>
          </div>
        `
      });

      res.status(200).json({
        success: true,
        message: 'Registration notification sent successfully'
      });
    } catch (error) {
      console.error('Registration email error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send registration notification'
      });
    }
  }
};

module.exports = emailController;
