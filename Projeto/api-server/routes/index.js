var express = require('express');
var router = express.Router();
const Ficheiro = require('../controllers/ficheiro')


// filtros dos recursos
router.get('/recursos', function(req, res, next) {
    if(req.query['tipo'] != undefined){
      Ficheiro.lookUpTipo(req.query['tipo'])
        .then(dados =>{
            console.log(dados)
         res.status(200).jsonp(dados)})
        .catch(error => res.status(500).jsonp({error: error}))
    }
    else if(req.query['q'] != undefined){
      console.log(req.query)
      Ficheiro.lookUpRegex(req.query['q'])
        .then(dados =>{
            console.log(dados)
         res.status(200).jsonp(dados)})
        .catch(error => res.status(500).jsonp({error: error}))
    }
    else {
      //console.log("REQ USERRRR: " + JSON.stringify(req.user))
      Ficheiro.listarFicheiros()
      .then(dados => res.status(200).jsonp(dados))
      .catch(error => res.status(500).jsonp({error: error}))
    }
});

// Consultar um recurso com id rid
router.get('/recursos/:id', function(req, res, next) {
  id = req.params.id
  Ficheiro.lookUp(id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp({error: error}))    
});

// Lista os recursos baseados na data
router.get('/recursosData/:username/:data', function(req, res, next) {
  Ficheiro.lookUpData(req.params.username, req.params.data)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp({error: error}))    
});


// Inserir novo recurso
router.post('/recursos', function(req, res, next) {
  Ficheiro.inserirFile(req.body)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp({error: error})) 
});

// Elimina do mongo
router.delete('/recursos/del/:id', function(req, res, next) {
  id = req.params.id
  Ficheiro.delete(id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp({error: error}))
});


// Editar ficheiro
router.post('/recursos/:id', function(req,res,next) {
  id = req.params.id
  //console.log("REQ BODY: " + JSON.stringify(req.body))
  Ficheiro.alterarR(id,req.body['data'], req.body['produtor'], req.body['titulo'],req.body['tipo'])
      .then(dados => res.status(201).jsonp({dados: dados}))
      .catch(e => res.status(500).jsonp({error: e}))
  
})

//Comentários:

// Adiciona like
router.post('/addlike/:id', function(req,res,next) {
  id = req.params.id
  //console.log("REQ BODY: " + JSON.stringify(req.body))
  Ficheiro.likeR(id)
      .then(dados => res.status(201).jsonp({dados: dados}))
      .catch(e => res.status(500).jsonp({error: e}))
  
})

// Remove like
router.post('/removelike/:id', function(req,res,next) {
  id = req.params.id
  //console.log("REQ BODY: " + JSON.stringify(req.body))
  Ficheiro.likeout(id)
      .then(dados => res.status(201).jsonp({dados: dados}))
      .catch(e => res.status(500).jsonp({error: e}))
  
})


// Retorna os likes de um post
router.get('/likes/:id', function(req,res,next) {
  id = req.params.id
  //console.log("REQ BODY: " + JSON.stringify(req.body))
  Ficheiro.likeget(id)
      .then(dados => res.status(201).jsonp({dados: dados}))
      .catch(e => res.status(500).jsonp({error: e}))
  
})

// PESQUISA NO LIKEDBY
router.get('/pesquisalikes/:user/:id', function(req,res,next) {
  Ficheiro.jadeulike(req.params.user, req.params.id)
      .then(dados => res.status(201).jsonp({dados: dados}))
      .catch(e => res.status(500).jsonp({error: e}))
  
})

// Adiciona a likedby
router.post('/pushtolist/:user/:id', function(req,res,next) {
  Ficheiro.pushL(req.params.user, req.params.id)
      .then(dados => res.status(201).jsonp({dados: dados}))
      .catch(e => res.status(500).jsonp({error: e}))
  
})


// retira de likedby
router.post('/pullfromlist/:user/:id', function(req,res,next) {
  Ficheiro.pullL(req.params.user, req.params.id)
      .then(dados => res.status(201).jsonp({dados: dados}))
      .catch(e => res.status(500).jsonp({error: e}))
  
})

// Lista os recurso que tem like de um user:
router.get('/getfavs/:user', function(req,res,next) {
  Ficheiro.favs(req.params.user)
      .then(dados => res.status(201).jsonp({dados: dados}))
      .catch(e => res.status(500).jsonp({error: e}))
})  

// adiciona comentário
router.post('/addComment', function(req, res, next) {
  Ficheiro.inserirComentario(req.body)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp({error: error})) 
});

// lista os comentários de um recurso
router.get('/comments/:id', function(req, res, next) {
  id = req.params.id
  Ficheiro.listarComentarios(id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp({error: error})) 
});

// apaga comentários de um recurso
router.delete('/apagacomentario/:id', function(req, res, next) {
  id = req.params.id
  Ficheiro.deleteC(id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp({error: error}))
});

// apaga um comentários 
router.delete('/apaga/:id', function(req, res, next) {
  id = req.params.id
  Ficheiro.deleteOne(id)
    .then(dados => res.status(200).jsonp(dados))
    .catch(error => res.status(500).jsonp({error: error}))
});

module.exports = router;
