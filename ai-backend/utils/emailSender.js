const mg = require('../config/mailgun');

const sendConfirmationEmail = async (to, token) => {
  const data = {
    from: `Excited User <mailgun@${process.env.MAILGUN_DOMAIN}>`,
    to: to,
    subject: 'Confirm Your Email',
    text: `Please confirm your email by clicking on the following link: 
           ${process.env.FRONTEND_URL}/confirm-email/${token}`,
    html: `<p>Please confirm your email by clicking on the following link:</p>
           <a href="${process.env.FRONTEND_URL}/confirm-email/${token}">Confirm Email</a>`
  };

  console.log('Sending email with config:', {
    from: data.from,
    to: data.to,
    subject: data.subject,
    mailgunDomain: process.env.MAILGUN_DOMAIN
  });

  try {
    const result = await mg.messages().send(data);
    console.log('Email sent successfully:', result);
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

module.exports = { sendConfirmationEmail };
