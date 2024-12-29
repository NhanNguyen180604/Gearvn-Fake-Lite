const router = require('express').Router();
const { requireAuth } = require('@clerk/express');
const walletController = require('../controllers/walletController');

// /api/wallet
router.route('/:id/deposit')
    .post(requireAuth({ signInUrl: '/login' }), walletController.postDeposit);

router.route('/:id')
    .get(requireAuth({ signInUrl: '/login' }), walletController.getBalance);
module.exports = router;