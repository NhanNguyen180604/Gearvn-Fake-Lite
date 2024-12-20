const router = require('express').Router();
const subSystemUserController = require('../controllers/subSystemUserController');
const subSystemPaymentController = require('../controllers/subSystemPaymentController');
const { requireAuth } = require('@clerk/express');

// /api/sub-system/users
router.route('/users/register')
    .post(subSystemUserController.register);

router.route('/users/login')
    .post(subSystemUserController.login);

router.route('/payment')
    .post(requireAuth({ signInUrl: '/login' }), subSystemPaymentController.pay)

module.exports = router;