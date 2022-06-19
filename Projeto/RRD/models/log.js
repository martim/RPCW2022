var mongoose = require('mongoose')

var LogSchema = new mongoose.Schema({
    date: String,
    content: String,
    userId: String
})

module.exports = mongoose.model('log',LogSchema)