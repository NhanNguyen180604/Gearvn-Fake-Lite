const Product = require('../../models/productModel');
const Category = require('../../models/categoryModel');
const Brand = require('../../models/brandModel');
const asyncHandler = require('express-async-handler');
const cloudinaryWrapper = require('../others/cloudinaryWrapper');

/**
 * Get products with pagination
 * @route GET /api/products?page={your_page}&per_page={your_per_page}
 */
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

    // get filter from the request here
    let filter = {};
    if (req.query.q) {
        filter.name = { $regex: req.query.q.trim(), $options: "i" };
    }
    if (req.query.category) {
        filter.category = req.query.category;
    }
    if (req.query.min_price || !isNaN(parseInt(req.query.min_price))) {
        filter.price = {};
        filter.price.$gte = parseInt(req.query.min_price);
    }
    if (req.query.max_price || !isNaN(parseInt(req.query.max_price))) {
        if (!filter.price) filter.price = {};
        filter.price.$lte = parseInt(req.query.max_price);
    }
    let sort = {};
    if (req.query.price_sort) {
        console.log(req.query.price_sort);
        const order = parseInt(req.query.price_sort);
        if (order === 1 || order === -1)
            sort.price = order;
        console.log(sort);
    }

    const total = await Product.countDocuments(filter);
    const total_pages = Math.ceil(total / per_page);
    page = Math.min(page, total_pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * per_page;

    const products = await Product.find(filter)
        .skip(skip)
        .limit(per_page)
        .sort(sort);

    res.status(200).json({
        products: products,
        page: page,
        per_page: per_page,
        total_pages: total_pages,
        total: total,
    });
});

/**
 * Get a product by ID
 * @route GET /api/products/:id
 * @access public
 */
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
});

/**
 * Post a new product
 * @route POST /api/products
 * @access public
 */
const postProduct = asyncHandler(async (req, res) => {
    const { name, category, brand, description } = req.body;
    const price = parseInt(req.body.price);
    const stock = parseInt(req.body.stock);

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
    if (!(await Category.findOne({ name: category }))) {
        res.status(404);
        throw new Error("Category not found");
    }

    if (!brand) {
        res.status(400);
        throw new Error("Please provide a brand");
    }
    if (!(await Brand.findOne({ name: brand }))) {
        res.status(404);
        throw new Error("Brand not found");
    }

    if (!description) {
        res.status(400);
        throw new Error("Please provide a description");
    }

    if (isNaN(stock) || stock < 1) {
        res.status(400);
        throw new Error("Invalid stock number");
    }

    const product = await Product.create({
        name: name,
        price: price,
        category: category,
        brand: brand,
        description: description,
        stock: stock,
        overallRating: 0,
    });

    if (!product) {
        res.status(500);
        throw new Error("Something went wrong, could not create the product");
    }

    // check for images, then upload them
    if (req.files?.images) {
        let uploadedFiles = req.files.images;
        if (!Array.isArray(uploadedFiles))
            uploadedFiles = [uploadedFiles];

        const uploadedImages = await cloudinaryWrapper.uploadImages(uploadedFiles.map(file => file.data), `products/${product.id}`);
        product.images = uploadedImages;
        await product.save();
    }
    else {
        res.status(400);
        throw new Error("Please provide images for the product");
    }

    res.status(201).json(product);
});

/**
 * Update a product by ID
 * @route PUT /api/products/:id
 */
const putProduct = asyncHandler(async (req, res) => {
    if (req.body.overallRating){
        res.status(403);
        throw new Error("Not allowed to change overall rating");
    }

    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!product) {
        res.status(404);
        throw new Error("Product not found");
    }

    // TODO update images

    // TODO update images

    res.status(200).json(product);
});

/**
 * Delete a product by ID
 * @route DELEte /api/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    // delete the images
    await cloudinaryWrapper.deleteByPrefix(`products/${product.id}`);
    await cloudinaryWrapper.deleteFolder(`products/${product.id}`);

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