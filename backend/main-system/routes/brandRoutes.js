const router = require('express').Router();
const brandController = require('../controllers/brandController');

// /api/brands
router.route('/')
    .get(brandController.getBrands)
    .post(brandController.postBrand);

router.route('/:id')
    .get(brandController.getBrandById)
    .put(brandController.putBrand)
    .delete(brandController.deleteBrand);

module.exports = router;