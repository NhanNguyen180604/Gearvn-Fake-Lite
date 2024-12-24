const router = require('express').Router();
const categoryController = require('../controllers/categoryController');
const checkAdmin = require('../../middlewares/checkAdmin');

// /api/categories
router.route('/')
    .get(categoryController.getCategories)
    .post(checkAdmin, categoryController.postCategory);

router.route('/:name')
    .get(categoryController.getCategoryByName)
    .put(checkAdmin, categoryController.putCategory)
    .delete(checkAdmin, categoryController.deleteCategory);

module.exports = router;