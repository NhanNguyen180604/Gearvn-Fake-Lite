const router = require('express').Router();
const brandController = require('../controllers/brandController');
const checkAdmin = require('../../middlewares/checkAdmin');
const { getGuestCart, postGuestCart, putGuestCart, deleteGuestCart } = require('../controllers/guestCartController');

router.get('/', getGuestCart);
router.post('/', postGuestCart);
router.put('/', putGuestCart);
router.delete('/', deleteGuestCart);

module.exports = router;