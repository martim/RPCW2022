const mongoose = require('mongoose')
var Log = require('../models/log')

module.exports.list = () => {
    return Log
        .find()
        .sort({date:-1})
        .exec()
}

module.exports.insert = log => {
    var newLog = new Log(log)
    return newLog.save()
}
