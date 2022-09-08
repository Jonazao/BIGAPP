const express = require('express')
const router = express.Router()
const catchAsync = require('../utils/catchAsync')
const {isLoggedIn, validar, isAuthor} = require('../middleware')
const Campground = require('../models/campground')

router.get('/',catchAsync(async (req, res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}))

router.get('/new', isLoggedIn ,(req, res) => {
    res.render('campgrounds/new');
})

router.post('/', isLoggedIn,validar, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    req.flash('success','EL nuevo campamento está hecho')
    res.redirect('/campgrounds')
}))

router.get('/:id', catchAsync(async (req, res) => {
const campground = await Campground.findById(req.params.id).populate({
    path: 'reviews',
    populate:{
        path: 'author'
    }
}).populate('author');
  if(!campground){
    req.flash('error', 'No se ha encontrado tu campamento');
    return res.redirect('/campgrounds');
  }
  res.render ('campgrounds/show', {campground})
}))


router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const {id} = req.params
    const campground = await Campground.findById(id)
    if (!campground){
        req.flash('error', 'Tu campamento no existe')
        res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', {campground})
    }))

router.put('/:id',isLoggedIn, isAuthor, validar ,catchAsync(async (res, req)=>{
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    req.flash('success', 'Campamento Actualizado')
    res.redirect(`/campgrounds/${campground._id}`) 
}))

router.delete('/:id', isLoggedIn, isAuthor, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

module.exports = router
