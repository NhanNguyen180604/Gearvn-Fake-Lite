const router = require('express').Router();
const subSystemPaymentController = require('../controllers/subSystemPaymentController');
const { requireAuth } = require('@clerk/express');

// /api/sub-system/
router.route('/payment')
    .post(requireAuth({ signInUrl: '/login' }), subSystemPaymentController.pay);

module.exports = router;