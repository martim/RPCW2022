var mongoose = require('mongoose')
var Archive = require('../models/archive')

module.exports.list = () => {
    return Archive
            .find()
            .exec()
}

module.exports.lookUp = () => {
    return Archive
            .findOne({_id: mongoose.Types.ObjectId(id)})
            .exec()
}

module.exports.delete = id => {
    return Archive
            .deleteOne({_id: mongoose.Types.ObjectId(id)})
            .exec()
}

module.exports.insert = archive => {
    var newArchive = new Archive(archive)
    return newArchive.save()
}