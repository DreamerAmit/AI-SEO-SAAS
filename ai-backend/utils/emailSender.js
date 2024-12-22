const mg = require('../config/mailgun');

const sendConfirmationEmail = async (to, confirmationToken) => {
  const data = {
    from: `Pic2Alt Support <mailgun@${process.env.MAILGUN_DOMAIN}>`,
    to: to,
    subject: 'Confirm Your Email',
    text: `Please confirm your email by clicking on the following link: 
           ${process.env.FRONTEND_URL}/confirm-email/${confirmationToken}`,
    html: `<p>Please confirm your email by clicking on the following link:</p>
           <a href="${process.env.FRONTEND_URL}/confirm-email/${confirmationToken}">Confirm Email</a>`
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
