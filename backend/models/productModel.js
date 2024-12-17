const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
    images: [
        {
            type: String,
        }
    ]
});

module.exports = mongoose.model('Product', productSchema);