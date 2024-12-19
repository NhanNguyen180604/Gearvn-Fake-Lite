const Category = require('../models/categoryModel');
const Product = require('../models/productModel');
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
 * Get a category by ID
 * @route GET /api/categories/:id
 * @access public
 */
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
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
 * Update a category by ID
 * @route PUT /api/categories/:id
 * @access admin only
 */
const putCategory = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error("Where my new name");
    }

    const category = await Category.findByIdAndUpdate(req.params.id, { name: name }, { new: true });
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
});

/**
 * Delete a category by ID
 * @route DELETE /api/categories/:id
 * @access admin only
 */
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }

    // delete all products of this category
    await Product.deleteMany({ category: category._id });

    res.status(200).json(category);
});

module.exports = {
    getCategories,
    getCategoryById,
    postCategory,
    putCategory,
    deleteCategory,
};