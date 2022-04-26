var express = require('express');
var router = express.Router();
var Para = require("../controllers/para")

/* GET home page. */
router.get('/paras', function(req, res) {
    Para.listar()
        .then(data => {
          res.status(200).jsonp(data)
        })
        .catch(e=>{
          res.status(500).jsonp({error:e})
        })
});

router.post('/paras', function(req, res) {
    Para.inserir(req.body)
        .then(data => {
          res.status(200).jsonp(data)
        })
        .catch(e=>{
          res.status(501).jsonp({error:e})
        })
});

router.delete("/paras",function(req,res){
    var id = req.body.id
    Para.remove(id)
        .then(data => {
          res.status(200).jsonp(data)
        })
        .catch(e=>{
          res.status(502).jsonp({error:e})
        })
  })

router.put("/paras", function(req,res){
  Para.edit(req.body)
        .then(data => {
          res.status(200).jsonp(data)
        })
        .catch(e=>{
          res.status(503).jsonp({error:e})
        })
  
})

module.exports = router;