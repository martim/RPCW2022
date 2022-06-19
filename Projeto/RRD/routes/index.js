var express = require('express');
var router = express.Router();
var fs = require('fs')
var sha512 = require('js-sha512').sha512;

var multer = require('multer')
var upload = multer({ dest: 'uploads' })

var Recurso = require('../controllers/recurso')
var Log = require('../controllers/log')

function filtraRecursos(req, lista) {
  var r = []
  lista.forEach(rec => {
    if (req.level == "admin" || rec.isVis || (req.level == "producer" && rec.prodId == req.name))
      r.push(rec)
  })
  return r
}
/* GET home page. */
router.get('/recursos', function (req, res, next) {
  if (req.query['tipo'] != undefined) {
    Recurso.listType(req.query['tipo'])
      .then(dados => {
        res.status(200).jsonp(filtraRecursos(req, dados))
      })
      .catch(err => {
        res.status(502).jsonp({ error: err })
      })
  } else if (req.query['q'] != undefined) {
    Recurso.list()
      .then(dados => {
        var dadosReais = []
        dados.forEach(dado => {
          if (dado.name.includes(req.query['q'])) {
            dadosReais.push(dado)
          }
        })
        res.status(200).jsonp(filtraRecursos(req, dadosReais))
      })
      .catch(err => {
        res.status(503).jsonp({ error: err })
      })
  } else {
    Recurso.list()
      .then(dados => {
        res.status(200).jsonp(filtraRecursos(req, dados))
      })
      .catch(err => {
        res.status(504).jsonp({ error: err })
      })
  }
});

router.get('/logs', function (req, res, next) {
  if (req.level == "admin")
    Log.list()
      .then(dados => {
        res.status(200).jsonp(dados)
      })
      .catch(err => {
        res.status(504).jsonp({ error: err })
      })
  else
    res.status(403).jsonp({ error: "Não tem nível de acesso necessário" })
});

router.post('/recursos/delete/:id', function (req, res, next) {
  if (req.level == "admin")
    Recurso.delete(req.params.id)
      .then(dados => {
        var d = new Date().toISOString().substring(0, 19).replace('T', ' ')
        var log = { date: d, content: "O utilizador " + req.name + " removeu o recurso " + req.params.id, userId: req.name }
        Log.insert(log)
          .then(dados => {
            res.status(200).jsonp(dados)
          })
          .catch(err => {
            res.status(504).jsonp({ error: err })
          })
      })
      .catch(err => {
        res.status(503).jsonp({ error: err })
      })
  else
    res.status(403).jsonp({ error: "Não tem nível de acesso necessário" })
});


router.get('/recursos/:id', function (req, res, next) {
  Recurso.lookUp(req.params.id)
    .then(dados => {
      res.status(200).jsonp(dados)
    })
    .catch(err => {
      res.status(503).jsonp({ error: err })
    })

});


router.post('/recursos', (req, res) => {
  if (req.level == "admin" || req.level == "producer")
    Recurso.insert(req.body.recurso)
      .then(dados => {
        var d = new Date().toISOString().substring(0, 19).replace('T', ' ')
        var log = { date: d, content: "O utilizador " + req.name + " criou um recurso.", userId: req.name }
        Log.insert(log)
          .then(dados => {
            res.status(200).jsonp(dados)
          })
          .catch(err => {
            res.status(504).jsonp({ error: err })
          })
      })
      .catch(err => {
        res.status(502).jsonp({ error: err })
      })
  else
    res.status(403).jsonp({ error: "Não tem nível de acesso necessário" })

})

router.put('/recursos/:id', (req, res) => {
  Recurso.lookUp(req.params.id)
    .then(dados => {
      if (req.level == "admin" || (req.level == "producer" && dados.prodId == req.name))
        Recurso.edit(req.params.id, req.body.recurso)
          .then(dados => {
            var d = new Date().toISOString().substring(0, 19).replace('T', ' ')
            var log = { date: d, content: "O utilizador " + req.name + " editou o recurso " + req.params.id, userId: req.name }
            Log.insert(log)
              .then(dados => {
                res.status(200).jsonp(dados)
              })
              .catch(err => {
                res.status(504).jsonp({ error: err })
              })
          })
          .catch(err => {
            res.status(502).jsonp({ error: err })
          })
      else
        res.status(403).jsonp({ error: "Não tem nível de acesso necessário" })

    })
    .catch(err => {
      res.status(503).jsonp({ error: err })
    })
})

router.post('/recursos/removefile/:rid', (req, res) => {
  Recurso.lookUp(req.params.rid)
    .then(dados => {
      var fl = []
      dados.files.forEach(f => {
        if (f._id != req.body.file)
          fl.push(f)
      })
      if (req.level == "admin" || (req.level == "producer" && dados.prodId == req.name)) {
        Recurso.edit(req.params.rid, { files: fl })
          .then(dados => {
            var d = new Date().toISOString().substring(0, 19).replace('T', ' ')
            var log = { date: d, content: "O utilizador " + req.name + " editou o recurso " + req.params.rid, userId: req.name }
            Log.insert(log)
              .then(dados => {
                res.status(200).jsonp(dados)
              })
              .catch(err => {
                res.status(504).jsonp({ error: err })
              })
          })
          .catch(err => {
            res.status(502).jsonp({ error: err })
          })
      } else
        res.status(403).jsonp({ error: "Não tem nível de acesso necessário" })
    }).catch(err => {
      res.status(503).jsonp({ error: err })
    })
})

router.post('/recursos/addcomment/:rid', (req, res) => {
  Recurso.lookUp(req.params.rid)
    .then(dados => {
      var cl = []
      dados.comments.forEach(f => {
        cl.push(f)
      })
      cl.push(req.body.com)
      if (req.level == "admin" || req.level == "producer") {
        Recurso.edit(req.params.rid, { comments: cl })
          .then(dados => {
            var d = new Date().toISOString().substring(0, 19).replace('T', ' ')
            var log = { date: d, content: "O utilizador " + req.name + " comentou no recurso " + req.params.rid, userId: req.name }
            Log.insert(log)
              .then(dados => {
                res.status(200).jsonp(dados)
              })
              .catch(err => {
                res.status(504).jsonp({ error: err })
              })
          })
          .catch(err => {
            res.status(502).jsonp({ error: err })
          })
      } else
        res.status(403).jsonp({ error: "Não tem nível de acesso necessário" })
    }).catch(err => {
      res.status(503).jsonp({ error: err })
    })
})
module.exports = router;
