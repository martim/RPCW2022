var express = require('express');
var router = express.Router();
var Paragraph = require('../controllers/paragraph')

/* GET users listing. */
router.get('/', function(req, res, next) {
  Paragraph.list()
    .then(data => {
      res.status(200).jsonp(data)
    })
    .catch(function(err) {
      res.status(500).jsonp({erro : err})

    })
});

router.post('/', function(req, res) {
  Paragraph.insert(req.body)
      .then(data => {
        res.status(201).jsonp(data)
      })
      .catch(err => {
        res.status(501).jsonp(err)
      })
});

router.put('/edit/:id', function(req, res){
  Paragraph.edit(req.params.id, req.body)
          .then(data => {
            res.status(202).jsonp(data)
          })
          .catch(err => {
            res.status(502).jsonp({erro: err})
          })
})

router.delete('/delete/:id', function(req, res){
  Paragraph.delete(req.params.id)
          .then(data => {
            res.status(203).jsonp(data)
          })
          .catch(err => {
            res.status(503).jsonp({erro: err})
          })
})

module.exports = router;
