if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const path = require('path')
const methodOverride = require ('method-override')
const ExpressError = require('./utils/ExpressError') 
const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const User = require('./models/user')
const LocalStrategy = require('passport-local')

const campgrounds = require('./routes/campgrounds')
const reviews = require ('./routes/reviews')
const users = require ('./routes/users')

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
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname, 'public')))

const sessionConfig = {
    secret: 'secreto',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7

    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next)=>{
    console.log(req.session)
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

app.use('/', users)
app.use('/campgrounds', campgrounds)
app.use('/campgrounds/:id/reviews', reviews)

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
