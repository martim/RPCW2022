var mongoose = require('mongoose')

var RecursoSchema = new mongoose.Schema({
    creDate: String,
    subDate: String,
    prodId: String,
    title: String,
    type: String,
    isVis: Boolean,
    files:[{
        name: String,
        mimetype: String,
        size: Number,
        path: String
    }],
    comments:[{
        date: String,
        content: String,
        userId: String
    }]
})

module.exports = mongoose.model('recurso',RecursoSchema)