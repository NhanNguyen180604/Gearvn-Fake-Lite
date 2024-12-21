const mongoose = require('mongoose');
const Product = require('./productModel');

const ratingSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    user: {
        type: string,
        required: true,
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
});

ratingSchema.post('save', async function () {
    const Rating = this.constructor;

    const stats = await Rating.aggregate([
        { $match: { product: this.product } },
        { $group: { _id: '$product', averageRating: { $avg: '$score' } } },
    ]);

    const averageRating = stats.length > 0 ? stats[0].averageRating : 0;

    // update the manga's overall rating
    await Product.findByIdAndUpdate(this.product, { overallRating: averageRating });
});

module.exports = mongoose.model('Rating', ratingSchema);