const express = require('express')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const Joi = require('joi')
const path = require('path')
const {campgroundSchema} = require('./joiSchema')
const Campground = require('./models/campground')
const methodOverride = require ('method-override')
const ExpressError = require('./utils/ExpressError') //ExpressError es un constructor que permite detectar errores según disponga la necesidad del código
const catchAsync = require('./utils/catchAsync')//Si no hay errrores asíncronos, catchAsync llaama a una función a que a su vez llama a next

mongoose.connect('mongodb://localhost:27017/campgrounds',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Error de conexión'))
db.once('open',()=>{
    console.log('Base de datos conectada')
})


const app = express()
const validar = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error){
        const mensaje = error.details.map(e=>e.message).join(',')
        throw new ExpressError(mensaje, 400)
    } else {
        next();
    }
}

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

app.get('/', (req, res)=>{
    res.render('home')
})


app.get('/campgrounds',catchAsync(async (req, res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds',validar, catchAsync(async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id} `)
}))

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
const campground = await Campground.findById(req.params.id)
res.render('campgrounds/show', {campground})
}))

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
    }))

app.put('/campgrounds/:id', validar ,catchAsync(async (res, req)=>{
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`) 
}))


app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.all('*',( req, res, next)=>{
    next (new ExpressError('Sitio no encontado', 404))
})
app.listen('5000',()=>{
    console.log('Puerto 5000')
})
app.use((err, req ,res, next)=>{
    const {statusCode = 500} = err
    if (!err.message) err.message = 'Cielos, te has encontrado con un error'
    res.status(statusCode).render('error', {err})
})
