const router = require('express').Router();
const brandController = require('../controllers/brandController');

// /api/brands
router.route('/')
    .get(brandController.getBrands)
    .post(brandController.postBrand);

router.route('/:name')
    .get(brandController.getBrandByName)
    .put(brandController.putBrand)
    .delete(brandController.deleteBrand);

module.exports = router;