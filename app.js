const express = require('express')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const Joi = require('joi')
const path = require('path')
const {campgroundSchema, reviewSchema} = require('./joiSchema')
const Campground = require('./models/campground')
const methodOverride = require ('method-override')
const ExpressError = require('./utils/ExpressError') 
const review = require('./models/review')
const campgrounds = require('./routes/campgrounds')
const reviews = require ('./routes/reviews')
const session = require('express-session')
const flash = require('connect-flash')

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

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('v8iews', path.join(__dirname, 'views'))


app.use((req, res, next)=>{
    res.locals.success = req.flash('succes')
    res.locals.error = req.flash('error')
    next();
})
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)
app.use(session(sessionConfig))
app.use(flash())

const sessionConfig = {
    secret: 'secreto',
    resave: false,
    saveUnitinitalized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7

    }
}

app.get('/', (req, res)=>{
    res.render('home')
})

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
