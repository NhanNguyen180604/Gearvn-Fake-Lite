const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    products: [
        {
            productID: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
                min: 1,
            }
        }
    ],
    totalPrice: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        required: true,
    }
    // how to user if third party?
});

orderSchema.pre('save', async function (next) {
    const Product = require('./productModel');
    let totalPrice = 0;
    for (const item of this.products) {
        const { price } = await Product.findById(item.productID).select('price');
        totalPrice += price * item.quantity;
    }
    this.totalPrice = totalPrice;
    next();
});

module.exports = mongoose.model('Order', orderSchema);