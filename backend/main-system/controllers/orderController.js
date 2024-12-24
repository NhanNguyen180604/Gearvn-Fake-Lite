const Order = require('../../models/orderModel');
const Product = require('../../models/productModel');
const Cart = require('../../models/cartModel');
const asyncHandler = require('express-async-handler');
const { clerkClient } = require('@clerk/express');

/**
 * Get order list, with filter
 * @route GET /api/orders
 * @access admin only
 * @query
 * - `id` (string): order's ID to match
 * - `phone_number` (string): customer's phone number
 * - `status` (string): either "Đang chờ", "Đang giao" or "Đã giao"
 * - `from` (string): the date in format DD/MM/YYYY
 * - `to` (string): the date in format DD/MM/YYYY
 * - `page` (number): page number
 * - `per_page` (number): number of orders per page
 */
const getOrders = asyncHandler(async (req, res) => {
    // get admin here
    const { userId } = req.auth;
    const user = await clerkClient.users.getUser(userId);
    if (user.publicMetadata.role !== 'admin') {
        res.status(401);
        throw new Error("You are not an admin");
    }

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

    const filter = {};
    if (req.query.id && req.query.id.trim().length) {
        filter.idString = { $regex: req.query.id, $options: "i" };
    }
    if (req.query.phone_number && req.query.phone_number.trim().length) {
        filter.phoneNumber = { $regex: req.query.phone_number, $options: "i" };
    }
    if (req.query.status && req.query.status.trim().length) {
        filter.status = { $regex: req.query.status, $options: "i" };
    }
    if (req.query.from && req.query.from.trim().length) {
        const fromDate = parseDate(req.query.from);
        if (!isNaN(fromDate))
            filter.createdAt = { $gte: fromDate };
    }
    if (req.query.to && req.query.to.trim().length) {
        const toDate = parseDate(req.query.to);
        if (!isNaN(toDate))
            filter.createdAt = { $lte: toDate };
    }

    const total = await Order.countDocuments(filter);
    const total_pages = Math.ceil(total / per_page);
    page = Math.min(page, total_pages);
    page = Math.max(page, 1);
    const skip = (page - 1) * per_page;

    const orders = await Order.find(filter)
        .skip(skip)
        .limit(per_page);

    res.status(200).json({
        orders: orders,
        page: page,
        per_page: per_page,
        total_pages: total_pages,
        total: total,
    });
});

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

const updateStatus = asyncHandler(async (req, res) => {
    // get admin here
    // const { userId } = req.auth;
    // const user = await clerkClient.users.getUsers(userId);
    // if (user.publicMetadata.role !== 'admin') {
    //     res.status(401);
    //     throw new Error("You are not an admin");
    // }

    const { status } = req.body;
    if (!["Đang chờ", "Đang giao", "Đã giao"].includes(status)) {
        res.status(401);
        throw new Error("Invalid status");
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status: status }, { new: true });
    if (!order) {
        res.status(404);
        throw new Error("Order not found");
    }

    res.status(200).json(order);
});

const parseDate = (date) => {
    const [day, month, year] = date.split('/').map(Number);
    return new Date(year, month - 1, day);
};

module.exports = {
    getOrderById,
    cancelOrder,
    getOrders,
    updateStatus,
};