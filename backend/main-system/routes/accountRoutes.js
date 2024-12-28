const router = require('express').Router();
const accountController = require('../controllers/accountController');
const checkAdmin = require('../../middlewares/checkAdmin');

// /api/accounts
router.route('/')
    .get(checkAdmin, accountController.getAccounts)

module.exports = router;
