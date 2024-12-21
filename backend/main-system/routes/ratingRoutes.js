const router = require('express').Router();
const ratingController = require('../controllers/ratingController');
const { requireAuth } = require('@clerk/express');

// /api/ratings
router.route('/')
    .get(requireAuth({ signInUrl: '/login' }), ratingController.getOneRating)
    .post(requireAuth({ signInUrl: '/login' }), ratingController.postRating);

module.exports = router;