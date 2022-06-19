var User = require('../models/user')

// Devolve todos os users da base de dados
module.exports.listar = () => {
    return User
        .find()
        .sort('username')
        .exec()
}


// Procura user segundo o seu username
module.exports.consultar = uname => {
    return User
        .findOne({username: uname})
        .exec()
}

// Inserir novo user no sistema
module.exports.inserir = u => {
    var novo = new User(u)
    return novo.save()
}


// Altera o level do user de Consumidor para Produtor
module.exports.alteraC = (uname) => {
    return User.findOneAndUpdate({username:uname},{$set: {level:"Produtor"} });
}

// Altera o level do user de Produtor para Consumidor
module.exports.alteraP = (uname) => {
    return User.findOneAndUpdate({username:uname},{$set: {level:"Consumidor"} });
}

// Remover um User do sistema
module.exports.remover = function(uname){
    return User.deleteOne({username: uname})
}


// Alterar o username de um User
module.exports.alterar = function(u){
    return User.findByIdAndUpdate({username: u.username}, u, {new: true})
}

// Consulta perfil
module.exports.consultarP = uname => {
    return User
        .findOne({username: uname})
        .exec()
}

//obtem password de um user
// Consulta perfil
module.exports.getpass = uname => {
    return User
        .findOne({username: uname},{password:1})
        .exec()
}

// altera pass do user
module.exports.mudapass = (uname, p) => {
    return User
        .findOneAndUpdate({username: uname},{$set:{password:p}})
        .exec()
}


// Altera a data última data de acesso
module.exports.alteraData = uname => {
    var data = new Date().toISOString()
    return User
        .findOneAndUpdate({username: uname},{$set:{dataonline:data}})
        .exec()
}