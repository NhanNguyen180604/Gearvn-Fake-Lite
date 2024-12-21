const Category = require('../../models/categoryModel');
const Product = require('../../models/productModel');
const asyncHandler = require('express-async-handler');

/**
 * Get all categories
 * @route GET /api/categories
 * @access public
 */
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    res.status(200).json(categories);
});

/**
 * Get a category by name
 * @route GET /api/categories/:name
 * @access public
 */
const getCategoryByName = asyncHandler(async (req, res) => {
    const category = await Category.findOne({ name: req.params.name });
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
});

/**
 * Post a new category
 * @route POST /api/categories
 * @access admin only
 */
const postCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error("Must provide a name for the category");
    }

    const categoryExist = await Category.findOne({ name: name });
    if (categoryExist) {
        return res.status(200).json(categoryExist);
    }

    const category = await Category.create({
        name: name,
    });
    res.status(201).json(category);
});

/**
 * Update a category by name
 * @route PUT /api/categories/:name
 * @access admin only
 */
const putCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error("Where my new name");
    }

    const category = await Category.findOneAndUpdate({ name: req.params.name }, { name: name }, { new: true });
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
});

/**
 * Delete a category by name
 * @route DELETE /api/categories/:name
 * @access admin only
 */
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findOneAndDelete({ name: req.params.name });
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }

    // delete all products of this category
    await Product.deleteMany({ category: category.name });

    res.status(200).json(category);
});

module.exports = {
    getCategories,
    getCategoryByName,
    postCategory,
    putCategory,
    deleteCategory,
};