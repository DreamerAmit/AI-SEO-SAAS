const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router.post('/send', emailController.sendEmail);

// New registration email route
router.post('/registration', emailController.sendRegistrationEmail);

module.exports = router;
