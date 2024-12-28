const Brand = require('../../models/brandModel');
const Product = require('../../models/productModel');
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
 * Get a brand by name
 * @route GET /api/brands/:name
 * @access public
 * @statusCode 404 if not found, 200 if success
 */
const getBrandByName = asyncHandler(async (req, res) => {
    const brand = await Brand.findOne({ name: req.params.name })
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
 * Update a brand by name
 * @route PUT /api/brands/:name
 * @access admin only
 */
const putBrand = asyncHandler(async (req, res) => {
    const { name } = req.body;
    if (!name) {
        res.status(400);
        throw new Error("Where my new name");
    }

    const brand = await Brand.findOneAndUpdate({ name: req.params.name }, { name: name }, { new: true });
    if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
    }

    res.status(200).json(brand);
});

/**
 * Delete a brand by name
 * @route DELETE /api/brands/:name
 * @access admin only
 */
const deleteBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.findOneAndDelete({ name: req.params.name });
    if (!brand) {
        return res.status(404).json({ message: "Brand not found" });
    }

    // delete all products of this brand
    await Product.deleteMany({ brand: brand.name });

    res.status(200).json({ success: true });
});

module.exports = {
    getBrands,
    getBrandByName,
    postBrand,
    putBrand,
    deleteBrand,
};