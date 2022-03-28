var express = require('express');
var router = express.Router();
var axios = require('axios');

router.post('/', function (req, res, next) {
    var al = req.params.prov
    axios.get("http://localhost:3000/musicas?prov=" + al)
        .then(response => {
            let a = response.data
            res.render('prov', { musicas: a })
        })
        .catch(function (erro) {
            res.render('error', { error: erro })
        })
})
/* GET home page. */
router.get('/:prov', function (req, res, next) {
    var al = req.params.prov
    axios.get("http://localhost:3000/musicas?prov=" + al)
        .then(response => {
            var lista = response.data
            res.render('prov', { musicas: lista })
        })
        .catch(function (erro) {
            res.render('error', { error: erro });
        })
})


module.exports = router;