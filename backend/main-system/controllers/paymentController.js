const asyncHandler = require('express-async-handler');
const axiosInstance = require('../../axios-config/axios-config');
const Order = require('../../models/orderModel');
const Cart = require('../../models/cartModel');
const Product = require('../../models/productModel');
const { clearCartHelper } = require('../controllers/cartController');

/**
 * Logged in user pays 
 * @route POST /api/sub-system/payment/:id
 */
const userPay = asyncHandler(async (req, res) => {
    try {
        const { fullName, phoneNumber, city, district, street, cardNumber, ccv, expiryDate } = req.body;
        const token = await req.auth.getToken();

        const cart = await Cart.findOne({ user: req.params.id });
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

        const response = await axiosInstance.post(`/api/payment/${req.params.id}/withdraw`,
            {
                amount: totalPrice,
                cardNumber,
                ccv,
                expiryDate,
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            }
        );

        if (response.status === 200 && response.data?.id) {
            const order = await Order.create({
                user: req.params.id,
                products: products,
                fullName: fullName,
                phoneNumber: phoneNumber,
                city: city,
                district: district,
                street: street,
                status: "Đang chờ",
                totalPrice: totalPrice,
            });
            res.status(200).json(order);
            await clearCartHelper(req.params.id, false);
        }
        else {
            return res.status(response.status).json(response.data)
        }
    }
    catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        throw error;
    }
});

/**
 * Guest pays
 * @route POST /api/sub-system/payment/guest
 */
const guestPay = asyncHandler(async (req, res) => {
    try {
        const { fullName, phoneNumber, city, district, street, cardNumber, ccv, expiryDate } = req.body;
        if (!req.session.guestCart || !req.session.guestCart.length) {
            res.status(400);
            throw new Error("Empty cart");
        }

        const products = [];
        let totalPrice = 0;
        req.session.guestCart.forEach(product => {
            totalPrice += product.price * product.quantity;
            products.push({
                productID: product._id,
                productName: product.name,
                productPrice: product.price,
                quantity: product.quantity,
            });
        });

        const response = await axiosInstance.post(`/api/payment/guest/withdraw`, {
            amount: totalPrice,
            cardNumber,
            ccv,
            expiryDate,
        });

        if (response.status === 200 && response.data?.id) {
            const order = await Order.create({
                user: 'guest',
                products: products,
                fullName: fullName,
                phoneNumber: phoneNumber,
                city: city,
                district: district,
                street: street,
                status: "Đang chờ",
                totalPrice: totalPrice,
            });
            req.session.guestCart = [];
            res.status(200).json(order);
        }
        else {
            return res.status(response.status).json(response.data)
        }
    }
    catch (error) {
        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        throw error;
    }
});

module.exports = {
    userPay,
    guestPay,
};