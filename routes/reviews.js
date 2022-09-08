const express = require('express')
const router = express.Router({mergeParams: true})
const catchAsync = require('../utils/catchAsync')
const {reviewSchema} = require('../joiSchema.js')
const ExpressError = require('../utils/ExpressError')
const Campground = require('../models/campground')
const review = require ('../models/review')
const {isLoggedIn, validarRev, isReviewAuthor} = require('../middleware')

router.post('/',validarRev  , catchAsync(async(req, res) => {
    const campground = await Campground.findById(req.params.id);
    const rev = new review(req.body.review);
    review.author = req.user._id
    campground.reviews.push(rev);
    await rev.save();
    await campground.save();
    req.flash('success', 'Nueva opinion')
    res.redirect(`/campgrounds/${campground._id}`);
}))

router.delete('/:reviewId', isReviewAuthor, catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });//el operador $pull elimina los caracteres de un string previamente es'ecificados
    await review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

module.exports = router

