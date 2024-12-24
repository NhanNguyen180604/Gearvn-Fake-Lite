const router = require('express').Router();
const paymentController = require('../controllers/paymentController');

router.route('/')
    .post(paymentController.pay);

module.exports = router;