const router = require('express').Router();
const paymentController = require('../controllers/paymentController');

router.route('/guest/withdraw')
    .get(paymentController.withdrawGuest);
router.route('/:id/')
    .get(paymentController.getBalance);
router.route('/:id/deposit')
    .post(paymentController.deposit);
router.route('/:id/withdraw')
    .post(paymentController.withdraw);

module.exports = router;
