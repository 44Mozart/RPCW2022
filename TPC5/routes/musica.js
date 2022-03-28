var express = require('express');
var router = express.Router();
var axios = require('axios');



/* GET home page. */
router.get('/:id', function (req, res, next) {
    var al = req.params.id
    axios.get("http://localhost:3000/musicas/" + al)
        .then(response => {
            var lista = response.data
            res.render('musica', { musica: lista })
        })
        .catch(function (erro) {
            res.render('error', { error: erro });
        })
})


module.exports = router;
