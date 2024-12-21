const Rating = require('../../models/ratingModel');
const asyncHandler = require('express-async-handler');

const postRating = asyncHandler(async (req, res) => {
    const { userId } = req.auth;

    const score = parseInt(req.body.score);
    if (isNaN(score) || score < 1 || score > 5) {
        res.status(400);
        throw new Error("Invalid score");
    }

    const productId = req.body.product;
    let rating = await Rating.findOne({ user: userId, product: productId });
    if (!rating) {
        rating = await Rating.create({
            user: userId,
            product: productId,
            score: score,
        });
    }
    else {
        rating.score = score;
        await rating.save();
    }

    res.status(200).json(rating);
});

const getOneRating = asyncHandler(async (req, res) => {
    const rating = await Rating.findOne({ user: userId, product: productId });
    if (!rating) {
        return res.status(404).json({ message: "No rating found" });
    }
    res.status(200).json(rating);
});

module.exports = {
    postRating,
    getOneRating,
};