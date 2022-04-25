const mongoose = require('mongoose');

var paragraphSchema = new mongoose.Schema({
    date: String,
    paragraph: String
})

module.exports = mongoose.model('paragraph', paragraphSchema);