const mongoose = require('mongoose');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');
const asyncHandler = require('express-async-handler');
const { clearCartHelper } = require('./cartController');

/**
 * Get order by id
 * @route GET /api/orders/:id
 * @access logged in only
 */
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    res.status(200).json(order);
});

/**
 * Create an order
 * @route POST /api/orders
 * @access logged in only
 */
const createOrder = asyncHandler(async (req, res) => {
    // get user here
    const user = new mongoose.Types.ObjectId('67614a1463989edb3b46ed71');
    const cart = await Cart.findOne({ user: user });
    const products = [];
    for (const product of cart.products) {
        const foundProduct = await Product.findById(product.productID);
        products.push({
            productID: foundProduct._id,
            productName: foundProduct.name,
            productPrice: foundProduct.price,
            quantity: product.quantity,
        });
    }

    const order = await Order.create({
        user: user,
        products: products,
        paid: false,
    });

    clearCartHelper(user, false);

    res.status(201).json(order);
});

const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // get user here
    const user = new mongoose.Types.ObjectId('67614a1463989edb3b46ed71');
    const cart = await Cart.findOne({ user: user });

    // refill the cart
    cart.products = order.products.map(product => ({
        productID: product.productID,
        quantity: product.quantity,
    }));
    await cart.save();

    // delete the order
    await order.deleteOne();
    res.status(200).json(order);
});

module.exports = {
    getOrderById,
    createOrder,
    cancelOrder,
};