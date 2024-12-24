const router = require('express').Router();
const ratingController = require('../controllers/ratingController');
const { requireAuth } = require('@clerk/express');

// /api/ratings
router.route('/')
    .get(ratingController.getRatingByProduct)
    .post(requireAuth({ signInUrl: '/login' }), ratingController.postRating);

router.route('/one')
    .get(requireAuth({ signInUrl: '/login' }), ratingController.getOneRating);

module.exports = router;