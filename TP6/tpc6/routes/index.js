var express = require('express');
var router = express.Router();
var fs = require('fs');

var multer = require('multer');
var upload = multer({ dest: 'uploads' })

var Archive = require('../controllers/archive')

/* GET home page. */
router.get('/', function(req, res, next) {
  Archive.list()
        .then(data => res.render('index', { list: data }))
        .catch(error => res.render('error', { error: error }))
});

router.post('/archive', upload.single('myArchive'), (req, res) => {
  let oldPath = __dirname + '/../' + req.file.path
  let newPath = __dirname + '/../archive/' + req.file.originalname

  fs.rename(oldPath, newPath, error => {
    if (error) throw error
  })

  const date = new Date().toISOString().substring(0,16).replace("T", " ")

  var archive = {
    date : date,
    name : req.file.originalname,
    mimetype : req.file.mimetype,
    size : req.file.size,
    description : req.body.description
  }

  Archive.insert(archive)
         .then(data => res.redirect('/'))
         .catch(error => res.render('error', { error : error}))
})

router.get('/delete/:id', function (req, res, next) {
  Archive.delete(req.params.id)
      .then(data => res.redirect('/'))
      .catch(error => res.render('error', { error : error }))
});

module.exports = router;
