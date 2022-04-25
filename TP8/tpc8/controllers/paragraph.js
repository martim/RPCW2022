var Paragraph = require('../models/paragraph');

module.exports.list = () => {
    return Paragraph
            .find()
            .exec()
}

module.exports.insert = (p) => {
    var date = new Date().toISOString().substring(0,16).replace("T", " ")
    p.date = date
    var newParagraph = new Paragraph(p)
    return newParagraph.save()
}

module.exports.edit = function(id,data) {
    var date = new Date().toISOString().substring(0,16).replace("T", " ")
    return Paragraph
                .updateOne({_id: id}, {date: date, paragraph: data.paragraph})
}

module.exports.delete = function(id) {
    return Paragraph
            .deleteOne({_id: id})
}