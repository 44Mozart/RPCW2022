var express = require('express');
var router = express.Router();
var fs = require('fs')
var axios = require('axios')
var multer  =require('multer');
const StreamZip = require('node-stream-zip');            
var upload = multer({dest: 'uploads'})
const passport = require('passport');
var jwt = require('jsonwebtoken');
const { Console } = require('console');


function isAuth(req , res , next){
    if(req.isAuthenticated()){
        next();
    } else{
        res.redirect("/login");
    }
  }


// Lista todos os users
router.get('/all',isAuth, function(req, res) {
    //{ search: 'hello', Submit: 'Enviar' }
    // console.log(req.body['search'])
    axios.get('http://localhost:3003/users/todos')
      .then(dados => res.render('usersAll', {dados: dados.data}))
      .catch(error => res.render('error', {error: error}))
});

// Apaga user
router.get('/delete/:user',isAuth, function(req, res) {
   if (req.user.level == "Admin"){
    username = req.params.user
    axios.get('http://localhost:3003/users/username/' + username)
    .then(dados => {
        console.log(dados.data)
        axios.delete('http://localhost:3003/users/del/' + dados.data.username)
            .then(dados => {
              res.redirect('/user/all')
            })
            .catch(e => res.render('error', {error: e}))
          }    

    )
    .catch(error => res.render('error', {error: error}))  }
    else {
      res.render('permissionAdmin')
    }
});

// Muda level do user
router.get('/mudarCons/:user',isAuth, function(req, res) {
  if (req.user.level == "Admin"){
    u = req.params.user
    axios.post('http://localhost:3003/users/mudarcons/' + u)
      .then(dados => res.render('suc', {dados: dados.data}))
      .catch(error => res.render('error', {error: error}))
  }
  else {
    res.render('permissionAdmin')
  }
});

// Muda level do user
router.get('/mudarProd/:user',isAuth, function(req, res) {
  if (req.user.level == "Admin"){
    u = req.params.user
    axios.post('http://localhost:3003/users/mudarprod/' + u)
      .then(dados => res.render('suc', {dados: dados.data}))
      .catch(error => res.render('error', {error: error}))
  } else {
    res.render('permissionAdmin')
  }
});

// Perfil do user 
router.get('/meuperfil',isAuth, function(req, res) {
    //console.log("USER:" + JSON.stringify(req.user[0].username))
    axios.get('http://localhost:3003/users/perfil/' + req.user.username)
      .then(dados => {
        axios.get('http://localhost:3001/api/getfavs/' + req.user.username + '?token=' + req.cookies.token)
        .then(favs =>{ 
          console.log("RECURSOS FAVORITOS" + JSON.stringify(favs.data.dados))
          res.render('perfiluser', {dados: dados.data, favs: favs.data.dados})})
        .catch(error => res.render('error', {error: error}))
      })
      .catch(error => res.render('error', {error: error}))
}); 

//  Alterar passe do user (form):
router.get('/mudapass/:username',isAuth, function(req, res) {
  //console.log("USER:" + JSON.stringify(req.user[0].username))
  axios.get('http://localhost:3003/users/getpass/' + req.params.username)
    .then(dados => res.render('mudapass', {dados: dados.data}))
    .catch(error => res.render('error', {error: error}))
}); 


// Altera a password e redireciona
router.post('/change',isAuth, function(req, res) {
  //console.log("USER:" + JSON.stringify(req.user[0].username))
  axios.post('http://localhost:3003/users/alterapass/' + req.user.username, req.body)
    .then(dados => res.redirect('/menu'))
    .catch(error => res.render('error', {error: error}))
}); 



module.exports = router;