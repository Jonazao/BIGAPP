const express = require('express')
const app = express()
const mongoose = require('mongoose')
const path = require('path')
const Campground = require('./models/campground')
const methodOverride = require ('method-override')

const db = mongoose.connection
db.on('error', console.error.bind(console, 'Error de conexión'))
db.once('open',()=>{
    console.log('Base de datos conectada')
})

mongoose.connect('mongodb://localhost:27017/app',{
    useNewUrlParser: true,
    //Originalmente, el código tría consigo 'useCreateIndex:true, pero al parecer la versión más reciente de mongoose ya no soporta esta opción'/
    useUnifiedTopology: true
})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))

app.get('/', (req, res)=>{
    res.render('home')
})

app.get('/makecampground',async (req, res)=>{
    const camp = new Campground({title: 'Mi patio', price: 'free', description: 'campamento en mi patio', location: 'afuera de mi casa'})
    await camp.save()
    res.send(camp)
})

app.get('/campgrounds', async (req, res)=>{
    const campgrounds = await Campground.find({})
    res.render('campgrounds/index', {campgrounds})
})

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
})

app.post('/campgrounds', async (req, res) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id} `)
})

app.get('campgrounds/:id', async (req, res) => {
const campground = await Campground.findById(req.params.id)
res.render('campgrounds/show', {campground})
})

app.get('campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
    })

app.put('campgrounds/:id',async (res, req)=>{
    const {id} = req.params
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground})
    res.redirect(`/campgrounds/${campground._id}`) 
})


app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
})

app.listen('5000',()=>{
    console.log('Puerto 5000')
})



