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
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
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
    stock: {
        type: Number,
        required: true,
        min: 0,
    },
    overallRating: {
        type: Number,
        default: 0,
    }
});

productSchema.index({ '$**': 'text' });

module.exports = mongoose.model('Product', productSchema);