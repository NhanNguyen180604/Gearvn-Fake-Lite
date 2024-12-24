const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { requireAuth } = require('@clerk/express');
const checkAdmin = require('../../middlewares/checkAdmin');
// /api/orders

router.route('/')
    .get(orderController.getOrders);
router.route('/:id')
    .get(requireAuth({ signInUrl: '/login' }), orderController.getOrderById)
    // .delete(orderController.cancelOrder)
    .put(checkAdmin, orderController.updateStatus)

module.exports = router;