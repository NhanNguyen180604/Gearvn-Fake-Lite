const router = require('express').Router();
const categoryController = require('../controllers/categoryController');

// /api/categories
router.route('/')
    .get(categoryController.getCategories)
    .post(categoryController.postCategory);

router.route('/:id')
    .get(categoryController.getCategoryById)
    .put(categoryController.putCategory)
    .delete(categoryController.deleteCategory);

module.exports = router;