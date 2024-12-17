const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Brand = require('../models/brandModel');
const asyncHandler = require('express-async-handler');

const getProducts = asyncHandler(async (req, res) => {
    let page = req.query.page || 1;
    let per_page = req.query.per_page || 20;

    page = parseInt(page);
    per_page = parseInt(per_page);

    if (isNaN(page) || page < 1) {
        res.status(400);
        throw new Error("Invalid page number");
    }

    if (isNaN(per_page) || per_page < 1) {
        res.status(400);
        throw new Error("Invalid per_page number");
    }

    let filter = {};  // add filter if needed later
    const total = await Product.countDocuments(filter);
    const total_pages = Math.ceil(total / per_page);
    page = Math.min(page, total_pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * per_page;

    const products = await Product.find(filter)
        .skip(skip)
        .limit(per_page)
        .populate([
            { path: 'category', model: 'Category', select: 'name' },
            { path: 'brand', model: 'Brand', select: 'name' },
        ]);

    res.status(200).json({
        products: products,
        page: page,
        per_page: per_page,
        total_pages: total_pages,
        total: total,
    });
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
});

const postProduct = asyncHandler(async (req, res) => {
    const { name, category, brand, description } = req.body;
    const price = parseInt(req.body.price);

    if (!name || !name.trim().length) {
        res.status(400);
        throw new Error("Please provide a name for the product");
    }

    if (!price) {
        res.status(400);
        throw new Error("Please provide a price for the product");
    }

    if (isNaN(price) || price < 0) {
        res.status(400);
        throw new Error("Invalid price");
    }

    if (!category) {
        res.status(400);
        throw new Error("Please provide a category");
    }
    if (!(await Category.findById(category))) {
        res.status(404);
        throw new Error("Category not found");
    }

    if (!brand) {
        res.status(400);
        throw new Error("Please provide a brand");
    }
    if (!(await Brand.findById(brand))) {
        res.status(404);
        throw new Error("Brand not found");
    }

    if (!description) {
        res.status(400);
        throw new Error("Please provide a description");
    }

    // TODO check for images, then upload them

    // TODO check for images, then upload them

    const product = await Product.create({
        name: name,
        price: price,
        category: category,
        brand: brand,
        description: description,
    });

    res.status(201).json(product);
});

const putProduct = asyncHandler(async (req, res) => {
    // pray that we dont put invalid category and brand IDs in req.body
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // TODO update images

    // TODO update images

    res.status(200).json(product);
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    // Do we have to delete order with this product or what? I guess not

    res.status(200).json(product);
});

module.exports = {
    getProducts,
    getProductById,
    postProduct,
    putProduct,
    deleteProduct,
};