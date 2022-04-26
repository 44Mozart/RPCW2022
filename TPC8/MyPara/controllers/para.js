var Para = require("../models/para")
const mongoose = require('mongoose');

module.exports.listar = function(){
    return Para.find().exec()
}

module.exports.inserir = function(p){
    var d = new Date()
    p.data = d.toISOString().substring(0,16)
    var newPara = new Para(p)
    return newPara.save()
}

module.exports.remove = function(id) {
    return Para
        .deleteOne({_id:mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.edit = function(dic){
    return Para
         .findOneAndUpdate({_id:mongoose.Types.ObjectId(dic["id"])},{para:dic["para"]})
         .exec()
}