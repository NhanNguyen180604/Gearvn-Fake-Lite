const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        // how to user if third party?
        user: {
            type: String,
            required: true,
        },
        products: [
            {
                productID: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                // in case the product gets deleted, the product name and price are still here
                productName: {
                    type: String,
                    required: true,
                },
                productPrice: {
                    type: Number,
                    required: true,
                    min: 0,
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
        paid: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true
    }
);

orderSchema.pre('save', async function (next) {
    let totalPrice = 0;
    for (const item of this.products) {
        totalPrice += item.productPrice * item.quantity;
    }
    this.totalPrice = totalPrice;
    next();
});

module.exports = mongoose.model('Order', orderSchema);