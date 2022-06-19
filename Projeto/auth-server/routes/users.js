var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken')
var passport = require('passport')


var User = require('../controllers/user')

/* GET users listing. */
router.get('/all', function (req, res, next) {
  User.listar()
    .then(dados => res.status(200).jsonp({ dados: dados }))
    .catch(e => res.status(500).jsonp({ error: e }))
});


// Consulta um user apartir do seu username:
router.get('/username/:id', function (req, res, next) {
  User.consultar(req.params.id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({ error: e }))
})


// Muda o level de um user de Consumidor para Produtor
router.post('/mudarcons/:username', function (req, res, next) {
  User.alteraC(req.params.username)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({ error: e }))
})

// altera a ultima data de acesso
router.post('/alteradata/:username', function (req, res, next) {
  User.alteraData(req.params.username)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({ error: e }))
})

// Muda o level de um user de Produtor para Consumidor
router.post('/mudarprod/:username', function (req, res, next) {
  User.alteraP(req.params.username)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({ error: e }))
})

// Lista todos os users
router.get('/todos', function (req, res, next) {
  User.listar()
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({ error: e }))
})

router.delete('/del/:user', function (req, res, next) {
  u = req.params.user
  User.remover(u)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp({ error: error }))
});

// Geração do token no login
// Dentro do sign -> o que queremos no token: username e nível de autorização
router.post('/login', function (req, res) {
  console.log("REQ : " + JSON.stringify(req.user))
  console.log("USER: " + JSON.stringify(req.user))
  console.log("BODY: " + JSON.stringify(req.body))
  //no sign metemos o que queremos dentro do token
  jwt.sign({
    username: req.body.username, level: req.body.level,
    sub: 'aula de RPCW'
  },
    "RPCW2022",
    { expiresIn: 3600 },
    function (e, token) {
      if (e) {
        console.log("ERRO TOKEN")
        res.status(505).jsonp({ error: "Erro na geração do token: " + e })
      }
      else {

        res.status(201).jsonp({ token: token })
      }
    });
})


router.post('/registar', function (req, res) {
  console.log(req.body)
  req.body.level = "Consumidor"
  req.body.dataonline = new Date().toISOString()
  User.consultar(req.body.username)
    .then(dados => {
      if (dados == null) {
        User.inserir(req.body)
          .then(dados => res.status(201).jsonp({ dados: dados }))
          .catch(e => res.status(500).jsonp({ error: e }))
      }
      else res.status(500).jsonp("User já existe!")
    }).catch(e => { res.status(500).jsonp({ error: e }) })

})

router.get('/perfil/:username', function (req, res, next) {
  User.consultarP(req.params.username)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({ error: e }))
})

router.get('/getpass/:username', function (req, res, next) {
  User.getpass(req.params.username)
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({ error: e }))
})

router.post('/alterapass/:username', function (req, res, next) {
  console.log("PASS:" + req.body['pass'])
  console.log("USER:" + req.params.username)
  User.mudapass(req.params.username, req.body['pass'])
    .then(dados => res.status(200).jsonp(dados))
    .catch(e => res.status(500).jsonp({ error: e }))
})



module.exports = router;
