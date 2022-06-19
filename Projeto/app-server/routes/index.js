var express = require('express');
var router = express.Router();
var fs = require('fs')
var axios = require('axios')
var multer = require('multer');
const StreamZip = require('node-stream-zip');
var upload = multer({ dest: 'uploads' })
const passport = require('passport');
var jwt = require('jsonwebtoken');
const { userLogger, paymentLogger } = require('../logger');
var AdmZip = require('adm-zip');
var caminho = require('path')

// Se o user estiver autenticado não tem a opção de autenticar de novo
function verificaLog(req, res, next) {
  if (req.isAuthenticated()) {
    res.redirect('/menu')
  } else {
    next();
  }
}

// Verifica se o user está autenticado
function isAuth(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
}

// Opções de Login/Registo
router.get('/', verificaLog, function (req, res) {
  res.render('homepage',);
});

// Menu do utilizador
router.get('/menu', isAuth, function (req, res) {
  console.log("DATA LOGOUT: " + req.user.dataonline)
  axios.get('http://localhost:3001/api/recursosData/' + req.user.username + '/' + req.user.dataonline + '?token=' + req.cookies.token)
    .then(dados => res.render('index', { dados: dados.data }))
    .catch(error => res.render('error', { error: error }))

});

// Painel do Admistrador
router.get('/admistrador', isAuth, function (req, res) {
  if (req.user.level == "Admin") {
    res.render('painel');
  }
  else {
    res.render('permissionAdmin')
  }
});

// LOGIN:
router.get('/login', function (req, res) {
  res.render('login-form');
});

router.post('/login', passport.authenticate('local', { failureRedirect: '/login', 'session': true }), function (req, res) {
  console.log("BODY " + JSON.stringify(req.body))
  console.log("USER " + JSON.stringify(req.user))
  userLogger.info('Sessão Inicializada', { User: `${req.user.username}` });
  axios.post('http://localhost:3003/users/login', req.user)
    .then(dados => {
      console.log(dados.data.token)
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false, // set to true if your using https
        httpOnly: true
      });
      res.redirect('/menu')
    })
    .catch(e => res.render('error', { error: e }))
});


router.get('/registo', function (req, res) {
  res.render('registo-form');
});

router.post('/registo', function (req, res) {
  /* userLogger.info('Novo utilizador registado', { User: `${req.user.username}` }); */
  axios.post('http://localhost:3003/users/registar', req.body)
    .then(dados => {
      res.cookie('token', dados.data.token, {
        expires: new Date(Date.now() + '1d'),
        secure: false,
        httpOnly: true
      });
      res.redirect('/menu')
    })
    .catch(e => res.render('error', { error: e }))
});



// Pede a lista de recursos à API e lista-os
router.get('/recursos', isAuth, function (req, res) {
  console.log(req.cookies)
  console.log("AUTH: " + JSON.stringify(req.user))
  axios.get('http://localhost:3001/api/recursos?token=' + req.cookies.token)
    .then(dados => res.render('recursos', { dados: dados.data }))
    .catch(error => res.render('error', { error: error }))
});


// Rota da SearchBar
router.post('/search', isAuth, function (req, res) {
  //{ search: 'hello', Submit: 'Enviar' }
  // console.log(req.body['search'])
  axios.get('http://localhost:3001/api/recursos?q=' + req.body['search'] + "&token=" + req.cookies.token)
    .then(dados => res.render('recursosPal', { dados: dados.data }))
    .catch(error => res.render('error', { error: error }))
});


// Pega nos ficheiros por tipo
router.get('/recursos/tipo/:type', isAuth, function (req, res) {
  tipo = req.params.type
  console.log(tipo)
  axios.get('http://localhost:3001/api/recursos?tipo=' + tipo + "&token=" + req.cookies.token)
    .then(dados =>
      res.render('recursosTipo', { dados: dados.data }))
    .catch(error => res.render('error', { error: error }))
});

// Consultar um ficheiro específico
router.get('/recursos/see/:id', isAuth, function (req, res) {
  id = req.params.id
  axios.get('http://localhost:3001/api/recursos/' + id + "?token=" + req.cookies.token)
    .then(dados => {
      //console.log("DADOS: " + JSON.stringify(dados.data))
      userLogger.info('Recurso Visualizado', { User: `${req.user.username}`, Recurso: `${dados.data.title}` });

      axios.get('http://localhost:3001/api/comments/' + dados.data._id + "?token=" + req.cookies.token)
        .then(com => {
          console.log("COM: " + JSON.stringify(com.data))
          axios.get('http://localhost:3001/api/likes/' + dados.data._id + "?token=" + req.cookies.token)
            .then(likes => {
              console.log("LIKES:" +JSON.stringify(likes.data.dados[0].likes))
              res.render('recurso', { dados: dados.data, com: com.data, likes: likes.data.dados[0] })})
            .catch(error => res.render('error', { error: error }))
        })
        .catch(error => res.render('error', { error: error }))

    })
    .catch(error => res.render('error', { error: error }))
});


// Form para inserir ficheiro
router.get('/novofile', isAuth, function (req, res) {
  res.render('novofile-form');
});

// Elimina um ficheiro
router.get('/recursos/del/:id', isAuth, function (req, res, next) {
  if (req.user.level == "Admin") {
    id = req.params.id
    axios.get('http://localhost:3001/api/recursos/' + id + "?token=" + req.cookies.token)
      .then(dados => {
        console.log(dados)
        let path = process.cwd() + '/public/FileSystem/' + dados.data.type + '/' + dados.data.pai
        fs.unlink(path, (err) => {
          if (err) {
            console.error(err)
            return
          }
          else {
            axios.delete('http://localhost:3001/api/recursos/del/' + id + "?token=" + req.cookies.token)
              .then(dados => {
                axios.delete('http://localhost:3001/api/apagacomentario/' + id + "?token=" + req.cookies.token)
                  .then(dados => {
                    res.redirect('/recursos')
                  })
                  .catch(e => res.render('error', { error: e }))
              })
              .catch(e => res.render('error', { error: e }))
          }

        })

      })
      .catch(error => res.render('error', { error: error }))
  }
  else {
    res.render('permissionAdmin')
  }
});



// Apaga um comentário de um recurso
router.get('/apagarC/:id/:idRec', isAuth, function (req, res, next) {
  if (req.user.level == "Admin") {
    id = req.params.id
    idRec = req.params.idRec
    axios.delete('http://localhost:3001/api/apaga/' + id + "?token=" + req.cookies.token)
      .then(dados => {
        console.log("DADOS: " + JSON.stringify(dados.data))
        axios.get('http://localhost:3001/api/recursos/' + idRec + "?token=" + req.cookies.token)
          .then(dados => {
            axios.get('http://localhost:3001/api/comments/' + idRec + "?token=" + req.cookies.token)
              .then(com => {
                axios.get('http://localhost:3001/api/likes/' + dados.data._id + "?token=" + req.cookies.token)
                .then(likes => {
                  console.log("LIKES:" +JSON.stringify(likes.data.dados[0].likes))
                  res.render('recurso', { dados: dados.data, com: com.data, likes: likes.data.dados[0] })})
                .catch(error => res.render('error', { error: error }))              
              })
              .catch(error => res.render('error', { error: error }))
          })
          .catch(error => res.render('error', { error: error }))


      })
      .catch(error => res.render('error', { error: error }))
  }
  else {
    res.render('permissionAdmin')
  }
});



//  EDITAR FICHEIRO
// Vai  buscar os dados ao mongo e introduz num forms (meter os values!) -> meter os outros campos à mão?
router.get('/editar/:id', isAuth, function (req, res) {
  //console.log("REQ:USER:EDITAR: " + JSON.stringify(req.user))

  id = req.params.id
  axios.get('http://localhost:3001/api/recursos/' + id + "?token=" + req.cookies.token)
    .then(dados => {
      if (req.user.username == dados.data.submiter || req.user.level == "Admin") {
        res.render('recursoEditar', { dados: dados.data })
      }
      else {
        res.render('permissionAdminUser')
      }
    })
    .catch(e => res.render('error', { error: e }))

})

// Manda os novos dados introduzidos para o forms para a API que altera no mongo
router.post('/editar/:id', function (req, res) {
  id = req.params.id
  allowed = ["Manuais", "Fichas", "Testes", "Slides"]

  if (!(allowed.includes(req.body['tipo']))) {
    res.render('Invalidchanges')
  }
  else {
    axios.post('http://localhost:3001/api/recursos/' + id + "?token=" + req.cookies.token, req.body)
      .then(dados => {

        var zip = new AdmZip(process.cwd() + '/public/FileSystem/' + dados.data.dados.type + '/' + dados.data.dados.pai)
        var updated = {
          "date_create": req.body['data'],
          "producer": req.body['produtor'],
          "title": req.body['titulo'],
          "type": req.body['tipo']
        }
        //var updated = {"date_create:" + '"' + req.body['data'] + '","producer": "' + req.body['produtor'] +  '","title":  "' + req.body['titulo']+'","type": " '+ req.body['tipo']+'"}
        var data = Buffer.from(JSON.stringify(updated));


        zip.addFile("RRD-SIP.json", data);   // New file created from contents in memory

        //zip.addLocalFile("trigger.json"); // Local file in file system

        zip.writeZip(process.cwd() + '/public/FileSystem/' + dados.data.dados.type + '/' + dados.data.dados.pai);

        /* const zip = new StreamZip({
          file: process.cwd() + '/public/FileSystem/' + dados.data.dados.type +'/'+ dados.data.dados.pai,
          storeEntries: true
        }) */

        /* zip.on('ready', () => {
          var updated = '{"date_create": "' + req.body['data'] + '","producer": "' + req.body['produtor'] +  '","title":  "' + req.body['titulo']+'","type": " '+ req.body['tipo']+'"}'
          var jsonObj = JSON.parse(updated);
          console.log(jsonObj);
  
  
          var jsonContent = JSON.stringify(jsonObj);
          console.log(jsonContent);
  
          //zip.extract(process.cwd() + '/public/FileSystem/' + dados.data.dados.type +'/'+ dados.data.dados.pai +'/RRD-SIP.json', './extracted', err => {
            
          zip.extract(process.cwd() + '/public/FileSystem/' + dados.data.dados.type +'/'+ dados.data.dados.pai + '/RRD-SIP.json', process.cwd() + '/public/FileSystem/' + dados.data.dados.type +'/'+ dados.data.dados.pai + '/RRD-SIP.json', err => {
            fs.writeFile("RRD-SIP.json", jsonContent, 'utf8', function (err) {
              if (err) {
                  console.log("An error occured while writing JSON Object to File.");
                  return console.log(err);
              }
              console.log("JSON file has been saved.");
          });
              console.log(err ? 'Extract error' : 'Extracted');
              zip.close();
          });
            
            //console.log(err ? 'Extract error' : 'Extracted');
            //zip.close();
        //});   
        }) */


        console.log("DADOS:" + JSON.stringify(dados.data.dados.type))
        let oldPath = process.cwd() + '/public/FileSystem/' + dados.data.dados.type + '/' + dados.data.dados.pai
        let newPath = process.cwd() + '/public/FileSystem/' + req.body['tipo'] + '/' + dados.data.dados.pai
        fs.rename(oldPath, newPath, function (err) {
          if (err) {
            throw err
          }
          else {
            console.log("Mudou ficheiros de pasta no filesystem")
          }
        })
        res.redirect('/menu')
      })
      .catch(e => res.render('error', { error: e }))
  }
})


// Download do ficheiro
router.get('/download/:tipo/:fnome', isAuth, function (req, res) {
  userLogger.info('Download de recurso efetuado', { User: `${req.user.username}`, Recurso: `${req.params.fnome}` });
  res.download(__dirname + '/../public/FileSystem/' + req.params.tipo + '/' + req.params.fnome)
})

// Download do ficheiro dos logs
router.get('/logs', isAuth, function (req, res) {
  res.download(__dirname + '/../UserInteraction.log')
})

// Dá reset no ficheiro dos logs
router.get('/logsres', isAuth, function (req, res) {
  fs.writeFile(__dirname + '/../UserInteraction.log', '', function () { console.log('done') })
})


function isthere(a, b) {
  for (i = 0; i < b.length; i++)
    if (b[i] == a) return true
  return false
}


// Insere novo ficheiro
router.post('/insere', isAuth, upload.single('myFile'), function (req, res, next) {
  //Verificações precisas: tipos, formatos dos ficheiros, se ficheiro existe
  console.log("REQ:USER: + " + JSON.stringify(req.user))
  var conteudo = []
  var objson = {}
  //var tiposAceites = ['Slides','TPC','Fichas', 'Testes']
  // Verifica os metadados
  var aceite = false
  // Verifica o manifesto
  var manifesto = false
  var manifestoC = true
  console.log("REQ:MIMETYPE: + " + JSON.stringify(req.file.mimetype))

  if (req.file.mimetype === 'application/zip') {
    const zip = new StreamZip({
      file: req.file.path,
      //trabalhar com as entries do ficheiro zip
      storeEntries: true
    })

    zip.on('ready', () => {

      for (const entry of Object.values(zip.entries())) {
        conteudo.push(entry.name)
        /* zip.extract(entry.path, process.cwd() + '/public/FileSystem/' + req.file.originalname, err => {
          console.log(err ? 'Extract error' : 'Extracted');
      }); */
      }

      if (conteudo.includes("RRD-SIP.json")) {
        metadados = zip.entryDataSync("RRD-SIP.json").toString('utf-8');
        obj = JSON.parse(metadados)

        if (obj.hasOwnProperty('date_create') && obj.hasOwnProperty('producer') && obj.hasOwnProperty('title') && obj.hasOwnProperty('type')) {
          aceite = true
        }
      }

      //console.log("ESTÁ ACEITE: " + aceite)
      if(isthere("manifestFile.txt", conteudo)) {
        manifesto = true

        data = zip.entryDataSync("manifestFile.txt").toString('utf8');
        file = data.split(" ")
    

        for (i in conteudo){
          if (isthere(conteudo[i], file) == false) {
            console.log("FILE: " + file)
            console.log("CONTEUDO: " + conteudo[i])
            manifestoC = false;
          }
        }
      }

      if (aceite && manifesto && manifestoC) {

        console.log(conteudo)
        dados = zip.entryDataSync("RRD-SIP.json").toString('utf-8');
        objson = JSON.parse(dados)
        console.log(objson)

        req.body.date_create = objson.date_create
        req.body.producer = objson.producer
        req.body.date_submit = new Date().toISOString()
        req.body.submiter = req.user.username
        req.body.title = objson.title
        req.body.type = objson.type
        req.body.content = conteudo
        req.body.likes = 0
        req.body.likedby = []
        req.body.pai = req.file.originalname
        console.log(req.body)
        zip.close();
        next();
      }

      else {
        // Se o ficheiro nao estiver bem tiramos da pasta de uploads e mostra mensagem de erro
        let upPath = process.cwd() + '/' + req.file.path

        try {
          fs.unlinkSync(upPath)
        } catch (err) {
          console.error(err)
        }

        res.render('ficheiro')

      }


    });
  }
}, function (req, res) {

  let oldPath = process.cwd() + '/' + req.file.path
  let newPath = process.cwd() + '/public/FileSystem/' + req.body.type + '/' + req.file.originalname

  // Só adiciona ficheiros se tiver permissões de admin e produtor
  if (req.user.level != "Consumidor") {
    fs.rename(oldPath, newPath, function (err) {
      if (err) {
        throw erro
      }
      else {
        axios.post('http://localhost:3001/api/recursos?token=' + req.cookies.token, req.body)
          .then(dados => {
            res.redirect('/recursos')
          })
          .catch(e => res.render('error', { error: e }))
      }
    })
  }
  else {
    res.render('permission')
  }
})

// Função de LogOut
router.get('/logout', function (req, res) {
  console.log("USER: " + req.user.username)
  axios.post('http://localhost:3003/users/alteradata/' + req.user.username)
    .then(dados => console.log("último acesso atualizado"))
    .catch(error => res.render('error', { error: error }))
  res.cookie(req.cookies.token, undefined)
  res.clearCookie();
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

// __________________ Comentários __________________//


// Adiciona um like ao ficheiro
router.post('/addlike', isAuth, function (req, res) {
  axios.get('http://localhost:3001/api/pesquisalikes/' + req.user.username + '/' + req.body.idRecurso + '?token=' + req.cookies.token)
    .then(count => {
      console.log("COUNT: " + JSON.stringify(count.data.dados))
        //se count for = a 0, o user nao meteu like -> mete no array e dá like
        if(count.data.dados == 0) {
          axios.post('http://localhost:3001/api/pushtolist/' + req.user.username + '/' + req.body.idRecurso + '?token=' + req.cookies.token)
              .then(posts => {
                axios.post('http://localhost:3001/api/addlike/' + req.body.idRecurso + "?token=" + req.cookies.token)
        .then(d => {
            axios.get('http://localhost:3001/api/recursos/' + req.body.idRecurso + "?token=" + req.cookies.token)
              .then(dados => {
                axios.get('http://localhost:3001/api/comments/' + req.body.idRecurso + "?token=" + req.cookies.token)
                  .then(com =>{
                    axios.get('http://localhost:3001/api/likes/' + req.body.idRecurso + "?token=" + req.cookies.token)
                            .then(likes => res.render('recurso', { dados: dados.data, com: com.data, likes: likes.data.dados[0] }))
                            .catch(error => res.render('error', { error: error }))
                })
                  .catch(error => res.render('error', { error: error }))
            })
            .catch(error => res.render('error', { error: error }))
          })
        .catch(error => res.render('error', { error: error }))
                     
                })
              .catch(error => res.render('error', { error: error }))
          
        }
        //se count for != a 0, o user nao meteu like -> mete no array e dá like
        else {
          axios.post('http://localhost:3001/api/pullfromlist/' + req.user.username + '/' + req.body.idRecurso + '?token=' + req.cookies.token)
              .then(posts => {
                axios.post('http://localhost:3001/api/removelike/' + req.body.idRecurso + "?token=" + req.cookies.token)
                      .then(d => {
                          axios.get('http://localhost:3001/api/recursos/' + req.body.idRecurso + "?token=" + req.cookies.token)
                          .then(dados => {
                          axios.get('http://localhost:3001/api/comments/' + req.body.idRecurso + "?token=" + req.cookies.token)
                            .then(com =>{
                              axios.get('http://localhost:3001/api/likes/' + req.body.idRecurso + "?token=" + req.cookies.token)
                            .then(likes => res.render('recurso', { dados: dados.data, com: com.data, likes: likes.data.dados[0] }))
                            .catch(error => res.render('error', { error: error }))
                })
                  .catch(error => res.render('error', { error: error }))
            })
            .catch(error => res.render('error', { error: error }))
          })
        .catch(error => res.render('error', { error: error })) 
                     
        })
      .catch(error => res.render('error', { error: error }))
    }

     })
    .catch(error => res.render('error', { error: error }))
  

});



// Adiciona um comentário ao ficheiro
router.post('/adicionarComentario', isAuth, function (req, res) {
  req.body.idUser = req.user.username
  req.body.data = new Date().toISOString().slice(0, 16)
  axios.post('http://localhost:3001/api/addComment?token=' + req.cookies.token, req.body)
    .then(d => {
      axios.get('http://localhost:3001/api/recursos/' + req.body.idRecurso + "?token=" + req.cookies.token)
        .then(dados => {

          axios.get('http://localhost:3001/api/comments/' + req.body.idRecurso + "?token=" + req.cookies.token)
            .then(com => {
  
              axios.get('http://localhost:3001/api/likes/' + req.body.idRecurso + "?token=" + req.cookies.token)

                        .then(likes => {
                          
                          res.render('recurso', { dados: dados.data, com: com.data, likes: likes.data.dados[0]})})
                        .catch(error => res.render('error', { error: error }))
            })
            .catch(error => res.render('error', { error: error }))
        })
        .catch(error => res.render('error', { error: error }))
    })
    .catch(error => res.render('error', { error: error }))
});

// rota preview

router.get('/preview/:type/:zipname/:filename', function(req, res){
  
  var type = req.params.type
  var zipname = req.params.zipname
  var filename = req.params.filename
  let path = __dirname + "/../public/FileSystem/" + type + "/" + zipname + ".zip"
  var tmp = __dirname + "/../tmp"
  if(!fs.existsSync(tmp)){
    fs.mkdirSync(tmp)
  }

  fs.readdirSync(tmp).forEach(file => {
      fs.unlinkSync(tmp + "/" + file)
  });

  var zip = AdmZip(path)
  zip.extractAllTo(tmp, true)
  res.sendFile(caminho.resolve(__dirname+ "/../tmp/" + filename))
})

module.exports = router;
