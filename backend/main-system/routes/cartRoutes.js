const router = require('express').Router();
const cartController = require('../controllers/cartController');

// /api/carts
router.route('/')
    .get(cartController.getCart)
    .put(cartController.putCart)
    .delete(cartController.clearCart);
    

module.exports = router;