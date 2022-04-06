var mongoose = require('mongoose')
var File = require('../models/files')

module.exports.list = () => {
    return File
        .find()
        .sort({ name: 1 })
        .exec()
}

module.exports.lookUp = id => {
    return File
        .findOne({ _id: mongoose.Types.ObjectId(id) })
        .exec()
}

module.exports.insert = file => {
    var newFile = new File(file)
    return newFile.save()
}

module.exports.delete = id => {
    return File
        .deleteOne({ _id: mongoose.Types.ObjectId(id) })
        .exec()
}