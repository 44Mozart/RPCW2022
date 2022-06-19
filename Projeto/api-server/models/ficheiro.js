const mongoose = require('mongoose')

var ficheiroSchema = new mongoose.Schema({
    date_create: { type: String, required: true },
    date_submit: { type: String, required: true },
    producer: String,
    submiter : String,
    title:  String,
    type: String,
    content: [String],
    likes: Number,
    likedby: [String],
    pai: String
});

module.exports = mongoose.model('ficheiro', ficheiroSchema)