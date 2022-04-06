var mongoose = require('mongoose')

var fileSchema = new mongoose.Schema({
    date: String,
    desc: String,
    name: String,
    mimetype: String,
    size: Number
})


module.exports = mongoose.model('file', fileSchema)