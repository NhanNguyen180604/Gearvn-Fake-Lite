const Brand = require('../models/brandModel');
const Product = require('../models/productModel');
const asyncHandler = require('express-async-handler');

/**
 * Get all brands
 * @route GET /api/brands
 * @access public
 */
const getBrands = asyncHandler(async (req, res) => {
    const brands = await Brand.find();
    res.status(200).json(brands);
});

/**
 * Get a brand by ID
 * @route GET /api/brands/:id
 * @access public
 * @statusCode 404 if not found, 200 if success
 */
const getBrandById = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json(brand);
});

/**
 * Post a new brand
 * @route POST /api/brands
 * @access admin only
 */
const postBrand = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error("Must provide a name for the brand");
    }

    const brandExist = await Brand.findOne({ name: name });
    if (brandExist) {
        return res.status(200).json(brandExist);
    }

    const brand = await Brand.create({
        name: name,
    });
    res.status(201).json(brand);
});

/**
 * Update a brand by ID
 * @route PUT /api/brands/:id
 * @access admin only
 */
const putBrand = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error("Where my new name");
    }

    const brand = await Brand.findByIdAndUpdate(req.params.id, { name: name }, { new: true });
    if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json(brand);
});

/**
 * Delete a brand by ID
 * @route DELETE /api/brands/:id
 * @access admin only
 */
const deleteBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
    }

    // delete all products of this brand
    await Product.deleteMany({ brand: brand._id });

    res.status(200).json(brand);
});

module.exports = {
    getBrands,
    getBrandById,
    postBrand,
    putBrand,
    deleteBrand,
};