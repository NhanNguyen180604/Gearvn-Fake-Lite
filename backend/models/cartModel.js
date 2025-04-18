const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
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
            quantity: {
                type: Number,
                required: true,
                min: 1,
            }
        }
    ],
});

module.exports = mongoose.model('Cart', cartSchema);