const express = require('express')
const router = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const {reviewSchema} = require('../joiSchema.js')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const Review = require ('../models/review')
const {isLoggedIn, validarRev, isReviewAuthor} = require('../middleware')
const reviews = require('../controllers/reviews')

router.post('/', isLoggedIn, validarRev, catchAsync(reviews.createReview))

router.delete('/:reviewID', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router

