const router = require('express').Router();
const brandController = require('../controllers/brandController');
const checkAdmin = require('../../middlewares/checkAdmin');

// /api/brands
router.route('/')
    .get(brandController.getBrands)
    .post(checkAdmin, brandController.postBrand);

router.route('/:name')
    .get(brandController.getBrandByName)
    .put(checkAdmin, brandController.putBrand)
    .delete(checkAdmin, brandController.deleteBrand);

module.exports = router;