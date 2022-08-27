const mongoose = require('mongoose')
const Schema = mongoose.Schema
const review = require('./review')

const CampgroundSchema = new Schema({
    title: String,
    price: String,
    description: String,
    location: String,
    image: String, 
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'review'
        }
    ]

});
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await review.deleteMany({
            _id: {
                $in: doc.reviews //$in se refiere a los caracteres dentro de, o cuerpo del string
            }
        })
    }
})// esta función se encarga de que los comentarios borrados sean borrados también de la base de datos


 module.exports = mongoose.model('Campground', CampgroundSchema)