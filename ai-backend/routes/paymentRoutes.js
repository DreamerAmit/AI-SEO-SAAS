const express = require('express');
const router = express.Router();
const isAuthenticated = require("../middlewares/isAuthenticated");
const paymentController = require('../controllers/paymentController');

router.post('/create-checkout-session', isAuthenticated, paymentController.createCheckoutSession);

module.exports = router;
