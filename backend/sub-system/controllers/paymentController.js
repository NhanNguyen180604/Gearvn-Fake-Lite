const asyncHandler = require('express-async-handler');
const { clerkClient } = require('@clerk/express');
const Order = require('./../../models/orderModel');

const pay = asyncHandler(async (req, res) => {
    const { userId } = req.auth;

    const order = await Order.findById(req.body.orderId);
    if (!order) {
        return res.status(404).json("Order not found");
    }

    if (order.paid) {
        return res.status(400).json("Order already paid");
    }

    if (order.user !== userId) {
        return res.status(400).json("User id not matched");
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata.balance < order.totalPrice) {
        return res.status(400).json("Not enough money");
    }

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

    order.set('paid', true);
    order.save();
    res.status(200).json({
        order: order,
        user: await clerkClient.users.getUser(userId),
    });
});

module.exports = {
    pay,
};