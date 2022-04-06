var express = require('express');
var router = express.Router();
var multer = require('multer');
var jsonfile = require('jsonfile');
var fs = require('fs');

var File = require('../controllers/files');
var upload = multer({ dest: 'uploads' })

/* GET home page. */
router.get('/', function (req, res, next) {
  File.list()
    .then(data => {
      if (data.length > 0) {
        res.render('index', { files: data, empty: false })
      }
      else res.render('index', { empty: true })

    })
    .catch(error => res.render('error', { error: error }))
});


router.post('/insert', upload.single('myFile'), (req, res) => {
  var d = new Date().toISOString().substring(0, 16)

  let oldPath = __dirname + '/../' + req.file.path
  let newPath = __dirname + '/../public/images/' + req.file.originalname

  fs.rename(oldPath, newPath, erro => {
    if (erro) res.render('error', { error: erro })
  })

  var file = {
    date: d,
    desc: req.body.desc,
    name: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size
  }

  File.insert(file)
    .then(() => { res.redirect(301, '/') })
    .catch(erro => { res.render('erro', { error: erro }) })

});

router.post('/delete/:id', (req, res) => {
  File.lookUp(req.params.id)
    .then(data => {
      var path = __dirname + '/../public/images/' + data.name
      fs.unlink(path, erro => {
        if (erro) res.render('error', { error: erro })
      })
    })
    .catch(erro => { res.render('error', { error: erro }) })

  File.delete(req.params.id)
    .then(() => { res.redirect(301, '/') })
    .catch(erro => { res.render('error', { error: erro }) })

});

module.exports = router;