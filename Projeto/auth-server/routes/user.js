var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var passport = require('passport')

var User = require('../controllers/user')

router.get('/', function(req, res){
  User.listar()
    .then(dados => res.status(200).jsonp({dados: dados}))
    .catch(e => res.status(500).jsonp({error: e}))
})

router.post('/', function(req, res){
  User.consultar(req.body.username)
  .then(dados => {
    if(!dados){
      User.inserir(req.body)
      .then(dados => res.status(201).jsonp({success:true,dados: dados}))
      .catch(e => res.status(500).jsonp({error: e}))
    }else{
      res.status(201).jsonp({success:false})
    }
  })
  .catch(e => res.status(502).jsonp({error: e}))
  
})
  
router.post('/login', passport.authenticate('local'), function(req, res){
  jwt.sign({ username: req.user.username, level: req.user.level, 
    sub: 'RRD'}, 
    "RRD",
    {expiresIn: 3600},
    function(e, token) {
      if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
      else res.status(201).jsonp({token: token})
  });
})

router.get('/consumer', function(req, res){
  jwt.sign({ username: "" , level: "consumer", 
    sub: 'RRD'}, 
    "RRD",
    {expiresIn: 3600},
    function(e, token) {
      if(e) res.status(500).jsonp({error: "Erro na geração do token: " + e}) 
      else res.status(201).jsonp({token: token})
  });
})

module.exports = router;