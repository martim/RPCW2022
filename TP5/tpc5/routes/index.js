var express = require('express');
var axios = require('axios');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
   axios.get("http://localhost:3000/musicas")
    .then(response => {
        var music = response.data
        res.render('musicas', { musicas: music });
    })
    .catch(function(erro){
      res.render('error', { error: erro });
    })
});

router.get('/musicas', function(req, res, next) {
  axios.get("http://localhost:3000/musicas")
    .then(response => {
        var music = response.data
        res.render('musicas', { musicas: music });
    })
    .catch(function(erro){
      res.render('error', { error: erro });
    })
});

router.get('/musicas/:id', function(req, res, next) {
  axios.get("http://localhost:3000/musicas/"+req.params.id)
    .then(response => {
        var music = response.data
        res.render('musica', { musica: music });
    })
    .catch(function(erro){
      res.render('error', { error: erro });
    })
});

router.get('/musicas/prov/:idProvince', function(req, res, next) {
  axios.get("http://localhost:3000/musicas?prov="+req.params.idProvince)
    .then(response => {
        var music = response.data
        res.render('provincia', { musicas: music, prov: req.params.idProvince });
    })
    .catch(function(erro){
      res.render('error', { error: erro });
    })
});

module.exports = router;
