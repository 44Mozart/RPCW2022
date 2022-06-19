const mongoose = require("mongoose")
var Ficheiro = require('../models/ficheiro')
var Comment = require('../models/comentario')


//Devolve Lista de ficheiros do mongo
module.exports.listarFicheiros = () => {
    return Ficheiro
        .find().sort({date_submit:1})
        .exec()
}

// Insere um novo ficheiro dentro do mongo
module.exports.inserirFile = file => {
    var newFile = new Ficheiro(file)
    return newFile.save()
}

// Consulta um recurso em específico
module.exports.lookUp = id => {
    return Ficheiro
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

// Vau buscar os recursos por tipo
module.exports.lookUpTipo = tipo => {
    return Ficheiro.find({type : tipo}).exec()
}


// Retorna os recurso que foram postados antes da data
module.exports.lookUpData = (uname,data) => {
    return Ficheiro.find({submiter: {$ne: uname},date_submit : {$gte : data}}).exec()
}

// Elimina um recurso
module.exports.delete = id => {
    return Ficheiro
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

// Alterar um ficheiro
module.exports.alterarR = (id,d,p,t,ty) => {
    return Ficheiro.findOneAndUpdate({_id: id},{$set: {date_create:d,producer:p,title:t,type:ty}})
} 

// Search bar
module.exports.lookUpRegex = q => {
    var pattern = new RegExp(q) 
    return Ficheiro.find({title: { $regex: pattern}})
}

// Adicionar like ao ficheiro
module.exports.likeR = id => {
    return Ficheiro.findOneAndUpdate({_id: id},{$inc: {likes: 1}})
}

// Adicionar like ao ficheiro
module.exports.likeout = id => {
    return Ficheiro.findOneAndUpdate({_id: id},{$inc: {likes: -1}})
}

// Vê se um user já deu like num post ou não
module.exports.jadeulike = (user,id) => {
    return Ficheiro.find({_id: id, 'likedby' : {"$in": user}}).count()
}



//Insere user no array de likes de um post
module.exports.pushL = (user,id) => {
    return Ficheiro.updateOne({_id: id}, { $push: { likedby: user } })
}

// Lista os favoritos de um user
module.exports.favs = user => {
    return Ficheiro.find({'likedby' : {"$in": user}}).exec()
}

// Retira user da lista de likes de um post
module.exports.pullL = (user,id) => {
    return Ficheiro.updateOne({_id: id}, { $pull: { likedby: user } })
}

// Lista os likes de um recurso like ao ficheiro
module.exports.likeget = id => {
    return Ficheiro.find({_id: id},{likes:1}).exec()
}

// lista os comentários
module.exports.listarComentarios = id => {
    return Comment
        .find({idRecurso : id})
        .exec()
}

// Insere um novo comentário dentro do mongo
module.exports.inserirComentario = com => {
    var newC= new Comment(com)
    return newC.save()
}

// Delete de todos os comentários de um recurso
module.exports.deleteC = id => {
    return Comment
        .deleteMany({idRecurso: id})
        .exec()
}

// Delete de um comentário
module.exports.deleteOne = id => {
    return Comment
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

// Listar os comentários de um user
/* module.exports.deleteOne = id => {
    return Comment
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
} */