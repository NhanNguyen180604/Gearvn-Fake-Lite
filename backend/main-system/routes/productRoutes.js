const router = require('express').Router();
const productController = require('../controllers/productController');
const checkAdmin = require('../../middlewares/checkAdmin');

// /api/products
router.route('/')
    .get(productController.getProducts)
    .post(checkAdmin, productController.postProduct);

router.route('/:id')
    .get(productController.getProductById)
    .put(checkAdmin, productController.putProduct)
    .delete(checkAdmin, productController.deleteProduct);

module.exports = router;