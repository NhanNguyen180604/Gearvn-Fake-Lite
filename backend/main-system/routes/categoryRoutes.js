const router = require('express').Router();
const categoryController = require('../controllers/categoryController');

// /api/categories
router.route('/')
    .get(categoryController.getCategories)
    .post(categoryController.postCategory);

router.route('/:name')
    .get(categoryController.getCategoryByName)
    .put(categoryController.putCategory)
    .delete(categoryController.deleteCategory);

module.exports = router;