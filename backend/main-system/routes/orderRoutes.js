const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('@clerk/express');

// /api/orders
router.route('/:id')
    .get(requireAuth({signInUrl: '/login'}), orderController.getOrderById)
    .delete(requireAuth({signInUrl: '/login'}), orderController.cancelOrder)


module.exports = router;