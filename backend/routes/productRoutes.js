const router = require('express').Router();
const productController = require('../controllers/productController');

// /api/products
router.route('/')
    .get(productController.getProducts)
    .post(productController.postProduct);

router.route('/:id')
    .get(productController.getProductById)
    .put(productController.putProduct)
    .delete(productController.deleteProduct);

module.exports = router;