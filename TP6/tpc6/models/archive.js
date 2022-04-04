var mongoose = require('mongoose');

var ArchiveSchema = new mongoose.Schema({
    date : String,
    name : String,
    mimetype : String,
    size : Number,
    description : String
});

module.exports = mongoose.model('archive', ArchiveSchema)