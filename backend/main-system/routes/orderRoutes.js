const router = require('express').Router();
const orderController = require('../controllers/orderController');

// /api/orders
router.route('/')
    .post(orderController.createOrder)

router.route('/:id')
    .get(orderController.getOrderById)
    .delete(orderController.cancelOrder)


module.exports = router;