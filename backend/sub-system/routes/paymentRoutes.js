const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('@clerk/express');

router.route('/')
    .post(requireAuth({ signInUrl: 'http://localhost:3000/login' }), paymentController.pay)

module.exports = router;