const mongoose = require('mongoose')
var Recurso = require('../models/recurso')

module.exports.list = () => {
    return Recurso
        .find()
        .sort({subDate:-1})
        .exec()
}

module.exports.listType = (tipo) => {
    return Recurso
        .find({type:tipo},{})
        .sort({subDate:-1})
        .exec()
}

module.exports.lookUp = id => {
    return Recurso
        .findOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.delete = id => {
    return Recurso
        .deleteOne({_id: mongoose.Types.ObjectId(id)})
        .exec()
}

module.exports.insert = recurso => {
    var newRecurso = new Recurso(recurso)
    return newRecurso.save()
}

module.exports.edit = function(id,data) {
    return Recurso.updateOne({_id:id},data)
}

