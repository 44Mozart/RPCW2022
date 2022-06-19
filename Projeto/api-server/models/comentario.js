const mongoose = require('mongoose')

var comentarioSchema = new mongoose.Schema({
    idRecurso: String,
    idUser: String,
    desc: String,
    data: String
});

module.exports = mongoose.model('comentario', comentarioSchema)