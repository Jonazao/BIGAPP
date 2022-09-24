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
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')

const MongoDBStore = require('connect-mongo')(session)


const campgrounds = require('./routes/campgrounds')
const reviews = require ('./routes/reviews')
const users = require ('./routes/users')

//Ademas del servidor local, el de mongo también puede ser usado, regularmente mse adjunta el enlace en un process.env pues este enlace incluye la contraseña
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
app.use(mongoSanitize({
    replaceWith: '_'
}))

const store = new MongoDBStore({
    url: 'mongodb://localhost:27017/campgrounds',
    secret: 'secreto',
    touchAfter: 24*60*60
})

store.on('error', function(err){
    console.log(err)
})

const sessionConfig = {
    store,
    name: 'session', 
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
app.use(helmet())

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

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dv5x8ia6k",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.get('/', (req, res)=>{
    res.render('home')
})

app.all('*',( req, res, next)=>{
    next (new ExpressError('Sitio no encontado', 404))
})
app.listen('3000',()=>{
    console.log('Puerto 3000')
})
app.use((err, req ,res, next)=>{
    const {statusCode = 500} = err
    if (!err.message) err.message = 'Cielos, te has encontrado con un error'
    res.status(statusCode).render('error', {err})
})
