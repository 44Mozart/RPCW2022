var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
router.get('/', function (req, res, next) {
  axios.get("http://localhost:3000/musicas")
    .then(response => {
      var lista = response.data
      res.render('index', { musicas: lista })
    })
    .catch(function (erro) {
      res.render('error', { error: erro });
    })
});



router.get('/musicas/insert', function (req, res, next) {
  res.render('forms')
});

router.post('/musicas', function (req, res, next) {
  console.log("POST de musica " + JSON.stringify(req.body))
  axios.post("http://localhost:3000/musicas", req.body)
  axios.get("http://localhost:3000/musicas")
    .then(response => {
      let a = response.data
      res.render('index', { musicas: a })
    })
    .catch(function (erro) {
      res.render('error', { error: erro })
    })
})

router.get('/musicas', function (req, res, next) {
  axios.get("http://localhost:3000/musicas")
    .then(response => {
      var lista = response.data
      res.render('index', { musicas: lista })
    })
    .catch(function (erro) {
      res.render('error', { error: erro });
    })
});


module.exports = router;
