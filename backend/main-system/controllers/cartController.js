const Cart = require('../../models/cartModel');
const Product = require('../../models/productModel');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

/**
 * Get a user's cart
 * @route GET /api/carts
 * @access logged in only
 */
const getCart = asyncHandler(async (req, res) => {
    // get user id here then get the cart
    const { userId } = req.auth;

    let cart = await Cart.findOne({ user: userId })
        .populate({ path: 'products.productID', model: 'Product' });
    if (!cart) {
        cart = await Cart.create({
            user: userId,
            products: [],
        });
    }
    res.status(200).json(cart);
});

/**
 * Update a user's cart
 * @route PUT /api/carts
 * @access logged in only
 */
const putCart = asyncHandler(async (req, res) => {
    // get user id here then get the cart
    const { userId } = req.auth;
    let cart = await Cart.findOne({ user: userId });

    // if cart doesn't exist, create one
    if (!cart) {
        cart = await Cart.create({
            user: userId,
            products: [],
        });
    }
    const { products } = req.body;  // each contains _id and quantity
    console.log(products)
    if (!products || !products.length) {
        res.status(400);
        throw new Error("Where my product");
    };

    // is this good code, i have no idea
    for (const product of products) {
        const foundProduct = await Product.findById(product._id);
        if (product.quantity > foundProduct.stock) {
            product.quantity = foundProduct.stock;
        }
        console.log(cart.products)
        const index = cart.products.findIndex(cartProduct => 
            cartProduct.productID.equals(product._id)
        );
        if (index >= 0) {
            cart.products[index].quantity += product.quantity;
        }
        else {
            cart.products.push({
                productID: product._id,
                quantity: product.quantity,
            });
            console.log(cart.products)
        }
    }
    await cart.save();

    res.status(200).json(cart);
});

/**
 * Clear a cart
 * @route DELETE /api/carts
 * @access logged in only
 */
const clearCart = asyncHandler(async (req, res) => {
    // get user id here
    const { userId } = req.auth;
    const clearedCart = await clearCartHelper(userId, req.params.restock);
    res.status(200).json(clearedCart);
});

/**
 * Use this to clear cart after paying an order I guess
 * @param {string} user - user's id
 * @param {boolean} restock - set to true to restock the products if the customer decided not to buy
 */
const clearCartHelper = asyncHandler(async (user, restock) => {
    const cart = await Cart.findOne({ user: user });
    if (restock) {
        for (const product of cart.products) {
            const foundProduct = await Product.findById(product.productID);
            foundProduct.stock += product.quantity;
            await foundProduct.save();
        }
    }
    cart.products = [];
    await cart.save();
    return cart;
});

module.exports = {
    getCart,
    putCart,
    clearCart,
    clearCartHelper,
};
