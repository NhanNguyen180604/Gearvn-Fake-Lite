const Rating = require('../../models/ratingModel');
const asyncHandler = require('express-async-handler');

/**
 * Post a rating for a product
 * @route POST /api/ratings
 * @access logged in only
 * @requestBody JSON body
 * - `productId` (string): the product's id
 */
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

/**
 * Get ratings of a product
 * @route GET /api/ratings
 * @access public
 * @requestBody JSON body
 * - `productId` (string): the product's id
 */
const getRatingByProduct = asyncHandler(async (req, res) => {
    const productId = req.body.product;
    const ratings = await Rating.find({ product: productId });
    if (!ratings) {
        return res.status(404).json({ message: "No rating found" });
    }
    res.status(200).json(ratings);
});

/**
 * Get a user's rating of a product, use this if you want to show the user their previous rating
 * @route GET /api/ratings/one
 * @access logged in only
 * @requestBody JSON body
 * - `productId` (string): the product's id
 */
const getOneRating = asyncHandler(async (req, res) => {
    const { userId } = req.auth;
    const productId = req.body.product;

    const rating = await Rating.findOne({ user: userId, product: productId });
    if (!rating) {
        return res.status(404).json({ message: "No rating found" });
    }
    res.status(200).json(rating);
});

module.exports = {
    postRating,
    getRatingByProduct,
    getOneRating,
};