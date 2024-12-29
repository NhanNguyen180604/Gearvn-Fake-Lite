const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('@clerk/express');

// /api/sub-system/
router.route('/payment/guest')
    .post(paymentController.guestPay)
router.route('/payment/:id')
    .post(requireAuth({ signInUrl: '/login' }), paymentController.userPay);

module.exports = router;