const mongoose = require('mongoose')
const ciudades = require('./ciudades')
const Campground = require('../models/campground')
const {places, descriptors} = require('./seeds')

mongoose.connect('mongodb://localhost:27017/campgrounds',{
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión'))
db.once('open',()=>{
    console.log('Base de datos conectada')
})

const muestra = arr => arr[Math.floor(Math.random()*arr.length)]

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i<50; i++){          
        const rndm = Math.floor(Math.random()*1000 + 1)
        const camp  = new Campground({
        location: `${ciudades[rndm].city}, ${ciudades[rndm].state} `,
        title: `${muestra(descriptors)} ${muestra(places)}`, 
        image: 'https://source.unsplash.com/collection/483251',
        description: 'Descripción generica.tex', 
        price: 1/Math.random()  
    })
    await camp.save()
}}     
 
seedDB().then(() => {
mongoose.connection.close()
})

