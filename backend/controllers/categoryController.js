const Category = require('../models/categoryModel');
const asyncHandler = require('express-async-handler');

/**
 * Get all categories
 * @route GET /api/categories
 * @access public
 * @statusCode 200 if success
 */
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find();
    res.status(200).json(categories);
});

/**
 * Get a category by ID
 * @route GET /api/categories/:id
 * @access public
 * @statusCode 404 if not found, 200 if success
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
 * @bodyParams name - category's name
 * @statusCode 400 if no name is provided, 200 if duplicate found, 201 if success
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
 * @bodyParams name - category's name
 * @statusCode 400 if no name is provided, 200 if duplicate found, 201 if success
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
 * @statusCode 404 if not found, 200 if success
 */
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
});

module.exports = {
    getCategories,
    getCategoryById,
    postCategory,
    putCategory,
    deleteCategory,
};