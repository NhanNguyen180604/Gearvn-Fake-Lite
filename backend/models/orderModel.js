const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
    {
        idString: {
            type: String,
            default: '',
        },
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
        fullName: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        district: {
            type: String,
            required: true,
        },
        street: {
            type: String,
            required: true,
        },
        totalPrice: {
            type: Number,
            default: 0,
        },
        status: {
            type: String,
            required: true,
            default: "Đang chờ",
            enum: ["Đang chờ", "Đang giao", "Đã giao"],
        }
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
    this.idString = this._id.toString();
    next();
});

module.exports = mongoose.model('Order', orderSchema);