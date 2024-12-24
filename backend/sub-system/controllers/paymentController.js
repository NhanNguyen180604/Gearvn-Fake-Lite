const asyncHandler = require('express-async-handler');
const { clerkClient } = require('@clerk/express');
const Order = require('./../../models/orderModel');
const Cart = require('../../models/cartModel');
const Product = require('../../models/productModel');
const { clearCartHelper } = require('../../main-system/controllers/cartController');

/**
 * Pay and create an order record
 * @route 
 * - `main-system route` POST /api/sub-system/payment
 * - `sub-system route` POST /api/payment
 */
const pay = asyncHandler(async (req, res) => {
    // get user here
    const { userId } = req.auth;
    const { fullName, phoneNumber, city, district, street } = req.body;

    const cart = await Cart.findOne({ user: userId });
    const products = [];
    let totalPrice = 0;
    for (const product of cart.products) {
        const foundProduct = await Product.findById(product.productID);
        products.push({
            productID: foundProduct._id,
            productName: foundProduct.name,
            productPrice: foundProduct.price,
            quantity: product.quantity,
        });
        totalPrice += foundProduct.price * product.quantity;
    }

    if (!products.length) {
        res.status(400);
        throw new Error("Product empty");
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata.balance < totalPrice) {
        return res.status(400).json("Not enough money");
    }

    const order = await Order.create({
        user: userId,
        products: products,
        fullName: fullName,
        phoneNumber: phoneNumber,
        city: city,
        district: district,
        street: street,
        status: "Đang chờ",
    });
    await clearCartHelper(userId, false);

    const newBalance = user.publicMetadata.balance - order.totalPrice;
    await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
            ...user.publicMetadata,
            balance: newBalance,
        },
    });

    const admin = await clerkClient.users.getUser(process.env.MAIN_ACCOUNT_ID);
    await clerkClient.users.updateUserMetadata(admin.id, {
        publicMetadata: {
            ...admin.publicMetadata,
            balance: admin.publicMetadata.balance + order.totalPrice,
        }
    })

    res.status(200).json({
        order: order,
        user: await clerkClient.users.getUser(userId),
    });
});

module.exports = {
    pay
};