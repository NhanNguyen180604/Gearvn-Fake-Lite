const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const Cart = require('../../models/cartModel');
const asyncHandler = require('express-async-handler');
const { clearCartHelper } = require('./cartController');
const { clerkClient } = require('@clerk/express');

/**
 * Get order by id
 * @route GET /api/orders/:id
 * @access logged in only
 */
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    res.status(200).json(order);
});


// TODO remake this
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    // get user here
    const { userId } = req.auth;
    const cart = await Cart.findOne({ user: userId });

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
    cancelOrder,
};