const router = require('express').Router();
const cartController = require('../controllers/cartController');
const { requireAuth, getAuth } = require('@clerk/express');

router.route('/')
    .get(requireAuth({ signInUrl: '/login' }), cartController.getCart)
    .put(requireAuth({ signInUrl: '/login' }), cartController.putCart)
    .delete(requireAuth({ signInUrl: '/login' }), cartController.clearCart);
    
module.exports = router;