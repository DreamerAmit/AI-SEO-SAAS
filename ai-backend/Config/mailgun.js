const mailgun = require('mailgun-js');
require('dotenv').config();

const mg = mailgun({
  apiKey: process.env.MAILGUN_API_KEY,
  domain: process.env.MAILGUN_DOMAIN
});

module.exports = mg;