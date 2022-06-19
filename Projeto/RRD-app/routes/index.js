var express = require('express');
var router = express.Router();
var axios = require('axios');
var fs = require('fs')
var sha512 = require('js-sha512').sha512;
var AdmZip = require('adm-zip');
const FormData = require('form-data');
var jwt = require('jsonwebtoken');

var multer = require('multer');
const { Z_PARTIAL_FLUSH } = require('zlib');
var upload = multer({ dest: 'uploads' })

function getFilePath(nome, file) {
  var hashName = sha512(nome)

  var path = __dirname + "/../files/"

  for (var i = 0; i < 10; i += 2) {
    path += hashName[i] + hashName[i + 1] + "/"
  }

  path += file

  return path
}

function generateManifest(files) {
  var fileList = []
  files.forEach(f => {
    fileList.push({ checksum: sha512(f), path: "data/" + f })
  })
  return { files: fileList }
}
function verifyToken(token) {
  var t = null;

  jwt.verify(token, "RRD", function (e, decoded) {
    if (e) {
      //console.log('Erro: ' + e)
    }
    else return t = decoded
  })

  return t
}

function getConsumerToken(url, res) {
  axios.get('http://rrd-auth:4050/users/consumer')
    .then(dados => {
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false,
        httpOnly: true
      })

      res.redirect(url)
    })
    .catch(error => res.render('error', { error }))
}

/* GET home page. */
router.get('/recursos', function (req, res, next) {
  if (!req.cookies.token) {
    getConsumerToken(req.originalUrl, res)
  }
  else {
    var token = verifyToken(req.cookies.token)
    axios.get("http://rrd-api:4040/api/recursos?token=" + req.cookies.token).then(resp => {
      res.render('recursos', { title: "RRD", list: resp.data, token: token })
    }).catch(err => {
      res.render('error', { title: "erro", message: err })
    })
  }
});

router.get('/logs', function (req, res, next) {
  if (!req.cookies.token) {
    getConsumerToken(req.originalUrl, res)
  }
  else {
    var token = verifyToken(req.cookies.token)
    if (token.level == 'admin') {
      axios.get("http://rrd-api:4040/api/logs?token=" + req.cookies.token).then(resp => {
        res.render('logs', { title: "RRD", list: resp.data })
      }).catch(err => {
        res.render('error', { title: "erro", message: err })
      })
    } else {
      res.render('permdenied', { title: "RRD", message: "Permissão negada!" })
    }
  }
});

router.post('/recursos/delete/:id', function (req, res, next) {
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    var token = verifyToken(req.cookies.token)
    if (token.level == 'admin') {
      axios.post("http://rrd-api:4040/api/recursos/delete/" + req.params.id + "?token=" + req.cookies.token).then(resp => {
        res.redirect("/recursos")
      }).catch(err => {
        res.render('error', { title: "erro", message: err })
      })
    } else
      res.render('permdenied', { title: "RRD", message: "Permissão negada!" })
  }
});

router.get('/recursos/add', function (req, res, next) {
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    var token = verifyToken(req.cookies.token)
    if (token.level == "producer" || token.level == "admin")
      res.render('formrecurso', { title: "RRD" })
    else {
      res.render('permdenied', { title: "RRD", message: "Permissão negada!" })
    }
  }
});

router.get('/register', function (req, res, next) {
  res.render('registerform', { title: "RRD" })
});

router.post('/register', function (req, res, next) {
  req.body.level = "producer"
  axios.post("http://rrd-auth:4050/users/", req.body)
    .then(resp => {
      if (resp.data.success) {
        res.render('afterreg', { title: "erro", message: "Utilizador registado com sucesso!" });
      }
      else {
        res.render('afterreg', { title: "erro", message: "Já existe um utilizador com esse username!" })
      }
    }).catch(err => {
      res.render('error', { title: "erro", message: err })
    })
});

router.get('/login', function (req, res, next) {
  res.render('loginform', { title: "RRD" })
});

router.post('/login', function (req, res) {
  axios.post('http://rrd-auth:4050/users/login', req.body)
    .then(dados => {
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      res.redirect('/')
    })
    .catch(e => res.render('errorwithback', { message: "Credenciais inválidas!", back: "/login" }))
});

router.get('/recursos/edit/:id', function (req, res, next) {
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    var token = verifyToken(req.cookies.token)
    axios.get("http://rrd-api:4040/api/recursos/" + req.params.id + "?token=" + req.cookies.token)
      .then(dados => {
        if (token.level == "admin" || (token.level == "producer" && token.username == dados.data.prodId)) {
          res.render('formeditrecurso', { title: "RRD", recurso: dados.data })
        } else {
          res.render('permdenied', { title: "RRD", message: "Permissão negada!" })
        }
      })
      .catch(err => {
        res.render('error', { title: "erro", message: err })
      })
  }
});

router.post('/recursos/:rid/removefile/:fid', upload.array(), function (req, res, next) {
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    axios.post("http://rrd-api:4040/api/recursos/removefile/" + req.params.rid + "?token=" + req.cookies.token, { file: req.params.fid })
      .then(resp => {
        res.redirect("/recursos/edit/" + req.params.rid)
      }).catch(err => {
        res.render('error', { title: "erro", message: err })
      })
  }
});

router.post('/recursos/:rid/addfile/', upload.single('myFile'), function (req, res, next) {
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    axios.get("http://rrd-api:4040/api/recursos/" + req.params.rid + "?token=" + req.cookies.token).then(recurso => {
      let oldPath = __dirname + '/../' + req.file.path
      let newPath = getFilePath(recurso.data.title, req.file.originalname)
      let newDir = newPath.replace("/" + req.file.originalname, "")
      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir, { recursive: true });
      }
      fs.renameSync(oldPath, newPath, erro => {
        if (erro) throw erro
      })
      var fl = recurso.data.files
      fl.push({
        name: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        path: newPath
      })
      axios.put("http://rrd-api:4040/api/recursos/" + req.params.rid + "?token=" + req.cookies.token, { recurso: { files: fl } })
        .then(resp => {
          res.redirect("/recursos/edit/" + req.params.rid)
        }).catch(err => {
          res.render('error', { title: "erro", message: err })
        })
    }).catch(err => {
      res.render('error', { title: "erro", message: err })
    })
  }
});

router.post('/recursos/editfields/:id', upload.array(), function (req, res, next) {
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    axios.put("http://rrd-api:4040/api/recursos/" + req.params.id + "?token=" + req.cookies.token,
      {
        recurso: {
          title: req.body.title,
          subDate: new Date().toISOString().substring(0, 16).replace('T', ' '),
          type: req.body.type,
          isVis: (req.body.vis == "publica")
        }
      }).
      then(resp => {
        res.redirect("/recursos")
      }).catch(err => {
        res.render('error', { title: "erro", message: err })
      })
  }
});

router.post('/recursos/addcomment/:id', upload.array(), function (req, res, next) {
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    var token = verifyToken(req.cookies.token)
    console.log(token)
    axios.post("http://rrd-api:4040/api/recursos/addcomment/" + req.params.id + "?token=" + req.cookies.token,
      {
        com: {
          date: new Date().toISOString().substring(0, 16).replace('T', ' '),
          content: req.body.com,
          userId: token.username
        }
      }).
      then(resp => {
        res.redirect("/recursos/" + req.params.id)
      }).catch(err => {
        res.render('error', { title: "erro", message: err })
      })
  }
});

router.get('/recursos/download/:id', function (req, res, next) {
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    axios.get("http://rrd-api:4040/api/recursos/" + req.params.id + "?token=" + req.cookies.token).then(dados => {
      var zip = new AdmZip()
      var fileNames = []
      dados.data.files.forEach(f => fileNames.push(f.name))
      zip.addFile("RRD-DIP.json", JSON.stringify(generateManifest(fileNames), null, 2))
      dados.data.files.forEach(file => {
        zip.addLocalFile(file.path, "/data/")
      })
      zip.addFile("metadata.json", JSON.stringify(dados.data, null, 2))
      res.writeHead(200, {
        "Content-Type": "application/zip",
        "Content-disposition": `attachment; filename=${dados.data.title}.zip`,
      });
      res.end(zip.toBuffer());
    }).catch(err => {
      res.render('error', { title: "erro", message: err })
    })
  }
});

router.get('/recursos/:id', function (req, res, next) {
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    var token = verifyToken(req.cookies.token)
    axios.get("http://rrd-api:4040/api/recursos/" + req.params.id + "?token=" + req.cookies.token)
      .then(dados => {
        res.render('recurso', { title: "RRD", recurso: dados.data, token: token })
      })
      .catch(err => {
        res.render('error', { title: "erro", message: err })
      })
  }
});


router.post('/genSIP', upload.any('myFiles'), function (req, res, next) {
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    var token = verifyToken(req.cookies.token)
    if (token.level == 'admin' || token.level == 'producer') {
      var fileNames = []
      req.files.forEach(f => fileNames.push(f.originalname))
      var zip = new AdmZip()
      zip.addFile("RRD-SIP.json", JSON.stringify(generateManifest(fileNames), null, 2))
      var files = []
      req.files.forEach(f => {
        let oldPath = __dirname + '/../' + f.path
        let oldPathwithName = __dirname + '/../uploads/' + f.originalname
        let newPath = getFilePath(req.body.title, f.originalname)
        fs.renameSync(oldPath, oldPathwithName, erro => {
          if (erro) throw erro
        })
        zip.addLocalFile(oldPathwithName, "/data/")
        files.push({
          name: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          path: newPath
        })
        fs.unlinkSync(oldPathwithName);
      })


      var d = new Date().toISOString().substring(0, 16).replace('T', ' ')

      var recurso = {
        creDate: d,
        subDate: d,
        prodId: token.username,
        title: req.body.title,
        type: req.body.type,
        isVis: (req.body.vis == "publica"),
        files: files
      }
      zip.addFile("metadata.json", JSON.stringify(recurso, null, 2))
      var formData = new FormData();
      formData.append("sip", zip.toBuffer(), req.body.title + ".zip");
      axios.post("http://localhost:4030/recurso?token=" + req.cookies.token, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(resp => {
          res.redirect("/recursos")
        })
        .catch(err => {
          res.render('error', { title: "erro", message: err })
        })
    } else {
      res.render('permdenied', { title: "RRD", message: "Permissão negada!" })
    }
  }

});

router.post('/recurso', upload.single('sip'), function (req, res, next) {
  var token = verifyToken(req.query["token"])
  if (token.level == 'admin' || token.level == 'producer') {
    var zip = new AdmZip(__dirname + "/../" + req.file.path)
    const zippath = __dirname + "/../sipfiles/"
    zip.extractAllTo(zippath)
    fs.unlinkSync(__dirname + "/../" + req.file.path);
    if (fs.existsSync(zippath + "metadata.json") && fs.existsSync(zippath + "RRD-SIP.json")) {
      var recurso = JSON.parse(fs.readFileSync(zippath + "metadata.json"))
      var man = JSON.parse(fs.readFileSync(zippath + "RRD-SIP.json"))
      var valid = true
      man.files.forEach(f => {
        if (!fs.existsSync(zippath + f.path)) {
          valid = false
        }
      })
      if (valid) {
        recurso.files.forEach(f => {
          let oldPath = zippath + "data/" + f.name
          let newPath = f.path.replace("/" + f.name, "")
          if (!fs.existsSync(newPath)) {
            fs.mkdirSync(newPath, { recursive: true });
          }
          fs.rename(oldPath, newPath + "/" + f.name, erro => {
            if (erro) throw erro
          })
        })
        fs.rm(__dirname + "/../sipfiles/", { recursive: true }, (err) => {
          if (err) {
            throw err;
          }
        })
        axios.post("http://rrd-api:4040/api/recursos?token=" + req.query["token"], { recurso: recurso }).then(resp => {
          res.status(200).jsonp(resp)
        }).catch(err => {
          res.render('error', { title: "erro", message: err })
        })
      } else {
        fs.rm(__dirname + "/../sipfiles/", { recursive: true }, (err) => {
          if (err) {
            throw err;
          }
        })
        res.render('error', { title: "erro", message: "SIP inválido" })
      }
    } else {
      res.render('error', { title: "erro", message: "SIP inválido" })
    }
  }
});

router.get('/', function (req, res, next) {
  console.log(req.cookies.token)
  if (!req.cookies.token) getConsumerToken(req.originalUrl, res)
  else {
    var token = verifyToken(req.cookies.token)
    if (!token) {
      getConsumerToken(req.originalUrl, res)
    }
    else {
      res.render('index', { title: "RRD", token: token })
    }
  }
});

router.post('/logout', function (req, res) {
  res.clearCookie("token");
  res.redirect("/");
})

module.exports = router;
