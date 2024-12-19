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
        ref: 'Category',
    },
    brand: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Brand',
    },
    images: [
        {
            url: {
                type: String,
                required: true,
            },
            // Cloudinary publicID to delete if needed
            publicID: {
                type: String,
                required: true,
            },
            _id: false,
        }
    ],
    description: {
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('Product', productSchema);