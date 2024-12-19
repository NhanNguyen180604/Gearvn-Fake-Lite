const router = require('express').Router();
const subSystemUserController = require('../controllers/subSystemUserController');
const subSystemPaymentController = require('../controllers/subSystemPaymentController');


// /api/sub-system/users
router.route('/users/register')
    .post(subSystemUserController.register);

router.route('/users/login')
    .post(subSystemUserController.login);

module.exports = router;