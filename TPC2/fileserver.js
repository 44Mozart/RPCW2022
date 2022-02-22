var http = require('http')
var fs = require('fs')

http.createServer(function (req, res) {
    var myurl = req.url.substring()
    if (myurl == "/filmes") {
        fs.readFile('./HTML/index.html', function (err, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            if (err) {
                res.write("<p>Erro na leitura do ficheiro</p>")
            }
            else {
                res.write(data)
            }
            res.end()
        })
    }
    else {
        var aux = myurl.substring(9)
        fs.readFile('./HTML/f' + aux + '.html', function (err, data) {
            res.writeHead(200, { 'Content-Type': 'text/html' })
            if (err) {
                res.write("<p>Erro na leitura do ficheiro</p>")
            }
            else {
                res.write(data)
            }
            res.end()
        })
    }
}).listen(7777)