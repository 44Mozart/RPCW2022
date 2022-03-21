const http = require('http')
const axios = require('axios')
const fs = require('fs')
const static = require('./static.js')
const { parse } = require('querystring')
const { Console } = require('console')


function recuperaInfo(request, callback) {
    if (request.headers['content-type'] == 'application/x-www-form-urlencoded') {
        let body = ''
        request.on('data', b => {
            body += b.toString()
        })
        request.on('end', () => {
            console.log(body)
            callback(parse(body))
        })
    }
}

// Funcção que gera página
function generatePage(tarefas, d) {
    var tarefasFeitas = []
    var tarefasPFazer = []
    tarefas.forEach(t => {
        if (t.status == 'realizar') {
            tarefasPFazer.push(t)
        }
        else {
            tarefasFeitas.push(t)
        }
    })
    let htmlPage = `
    <html>
        <head>
            <title>To do List </title>
            <meta charset="utf-8"/>
            <link rel="icon" href="todolist.png"/>
            <link rel="stylesheet" href="w3.css"/>
            <link rel="stylesheet" href="font.css"/>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
                integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
            <script src='https://kit.fontawesome.com/a076d05399.js' crossorigin='anonymous'></script>
        </head>
        <body>
            <div class="w3-container fixed-top" style="background-color:#012a4a; color:white">
                <h1>To do List</h1>
            </div>
        
            <form class="w3-container" style="margin-top:50pt !important" action="/tarefas/insert" method="POST">
                <label style="color:#014f86"><b>Tarefa</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" name="tarefa">

                <label style="color:#014f86"><b>Tipo</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" name="tipo">

                <label style="color:#014f86"><b>Data Deadline</b></label>
                <input class="w3-input w3-border w3-light-grey" type="date" name="deadline">

                <label style="color:#014f86"><b>Responsável</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" name="responsavel">
  
                <input class="w3-btn w3-section" style="color:#012a4a; background-color:#a9d6e5;" type="submit" value="Registar"/>
                <input class="w3-btn w3-section" style="color:#012a4a; background-color:#a9d6e5;" type="reset" value="Limpar valores"/> 
            </form>`
    htmlPage += `
        <div class="w3-row" style="background-color:#468faf;color:white;margin-bottom:29pt !important">
                <div class="w3-col l6 6 w3-center">
                    Tarefas Por Realizar`
    keys = ['Tarefa', 'Tipo', 'Criada em', 'Deadline', 'Responsável']

    htmlPage += '<table class="w3-table-all w3-centered w3-light-grey">\n<thead>\n<tr>'

    for (let i = 0; i < keys.length; i++) {
        htmlPage += `<th style="color:#012a4a">${keys[i]}</th>`
    }
    htmlPage += `</tr></thead>`

    tarefasPFazer.forEach(t => {
        htmlPage += `
            <tr>
                <td>${t.tarefa}</td>
                <td>${t.tipo}</td>
                <td>${t.data_criada}</td>
                <td>${t.deadline}</td>
                <td>${t.responsavel}</td>
                <td>
                    <form action="/tarefas/${t.id}/check" method="POST">
                        <button class="w3-button fa fa-check" style="background-color:#012a4a; color:white" type="submit" value ="Done"></button>
                    </form>
                </td>
                <td>
                    <form action="/tarefas/${t.id}/edit" method="POST">
                        <button class="w3-button" style="background-color:#012a4a; color:white" type="submit" value ="Edit"><i class='far fa-edit'></i></button>
                    </form>
                </td>
            </tr>`
    })
    htmlPage += `</table>
                </div>`
    htmlPage += `
            <div class="w3-col l6 6 w3-center">
                Tarefas Realizadas`

    htmlPage += '<table class="w3-table-all w3-centered w3-light-grey">\n<thead>\n<tr>'

    for (let i = 0; i < keys.length; i++) {
        htmlPage += `<th style="color:#012a4a">${keys[i]}</th>`
    }
    htmlPage += `</tr></thead>`

    tarefasFeitas.forEach(t => {
        htmlPage += `
                    <tr>
                        <td>${t.tarefa}</td>
                        <td>${t.tipo}</td>
                        <td>${t.data_criada}</td>
                        <td>${t.deadline}</td>
                        <td>${t.responsavel}</td>
                        <td>
                        <form action="/tarefas/${t.id}/delete" method="POST">
                            <button class="w3-button fa fa-close" style="background-color:#012a4a; color:white" type="submit" value ="Delete"></button>
                        </form>
                        </td>
                    </tr>
                `
    })
    htmlPage += `</table></div></div>
                `

    htmlPage += `
    <footer class="w3-container fixed-bottom" style="background-color:#013a63; color:white">
            <div >
                <address>Gerado por PG47488::RPCW2022 em ${d} --------------</address>
            </div>
            </footer></body></html>`
    return htmlPage
}

function generateEditPage(tarefas, tarefa, d) {
    var tarefasFeitas = []
    var tarefasPFazer = []
    tarefas.forEach(
        t => {
            if (t.status == 'realizar') {
                tarefasPFazer.push(t)
            } else {
                tarefasFeitas.push(t)
            }
        }
    )

    let htmlPage = `
    <html>
        <head>
            <title>To do List </title>
            <meta charset="utf-8"/>
            <link rel="icon" href="todolist.png"/>
            <link rel="stylesheet" href="w3.css"/>
            <link rel="stylesheet" href="font.css"/>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
                integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
            <script src='https://kit.fontawesome.com/a076d05399.js' crossorigin='anonymous'></script>
        </head>
        <body>
            <div class="w3-container fixed-top" style="background-color:#012a4a; color:white">
                <h1>To do List</h1>
            </div>
        
            <form class="w3-container" style="margin-top:50pt !important" action="/tarefas/${tarefa.id}/edit/confirm" method="POST">
                <label style="color:#014f86"><b>Tarefa</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" value="${tarefa.tarefa}" name="tarefa">

                <label style="color:#014f86"><b>Tipo</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" value="${tarefa.tipo}" name="tipo">

                <label style="color:#014f86"><b>Data Deadline</b></label>
                <input class="w3-input w3-border w3-light-grey" type="date" value="${tarefa.deadline}" name="deadline">

                <label style="color:#014f86"><b>Responsável</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" value="${tarefa.responsavel}" name="responsavel">
  
                <input class="w3-btn w3-section" style="color:#012a4a; background-color:#a9d6e5;" type="submit" value="Confirmar"/>
                <input class="w3-btn w3-section" style="color:#012a4a; background-color:#a9d6e5;" type="reset" value="Limpar valores"/> 

            </form>`
    htmlPage += `
        <div class="w3-row" style="background-color:#468faf;color:white;margin-bottom:29pt !important"">
                <div class="w3-col l6 6 w3-center">
                    Tarefas Por Realizar`

    htmlPage += '<table class="w3-table-all w3-centered w3-light-grey">\n<thead>\n<tr>'

    keys = ['Tarefa', 'Tipo', 'Criada em', 'Deadline', 'Responsável']

    for (let i = 0; i < keys.length; i++) {
        htmlPage += `<th style="color:#012a4a">${keys[i]}</th>`
    }
    htmlPage += `</tr></thead>`

    tarefasPFazer.forEach(t => {
        htmlPage += `
            <tr>
                <td>${t.tarefa}</td>
                <td>${t.tipo}</td>
                <td>${t.data_criada}</td>
                <td>${t.deadline}</td>
                <td>${t.responsavel}</td>
                <td>
                    <form action="/tarefas/${t.id}/check" method="POST">
                        <button class="w3-button fa fa-check" style="background-color:#012a4a; color:white" type="submit" value ="Done"></button>
                    </form>
                </td>
                <td>
                    <form action="/tarefas/${t.id}/edit" method="POST">
                        <button class="w3-button" style="background-color:#012a4a; color:white" type="submit" value ="Edit"><i class='far fa-edit'></i></button>
                    </form>
                </td>
            </tr>`
    })
    htmlPage += `</table>
                </div>`
    htmlPage += `
            <div class="w3-col l6 6 w3-center">
                Tarefas Realizadas`

    htmlPage += '<table class="w3-table-all w3-centered w3-light-grey">\n<thead>\n<tr>'

    for (let i = 0; i < keys.length; i++) {
        htmlPage += `<th style="color:#012a4a">${keys[i]}</th>`
    }
    htmlPage += '</tr></thead>'

    tarefasFeitas.forEach(t => {
        htmlPage += `
                    <tr>
                        <td>${t.tarefa}</td>
                        <td>${t.tipo}</td>
                        <td>${t.data_criada}</td>
                        <td>${t.deadline}</td>
                        <td>${t.responsavel}</td>
                        <td>
                        <form action="/tarefas/${t.id}/delete" method="POST">
                            <button class="w3-button fa fa-close" style="background-color:#012a4a; color:white" type="submit" value ="Delete"></button>
                        </form>
                        </td>
                    </tr>
                `
    })
    htmlPage += `</table></div></div>
                `

    htmlPage += `
    <footer>
            <div class="w3-container fixed-bottom" style="background-color:#013a63; color:white;">
                <address>Gerado por PG47488::RPCW2022 em ${d} --------------</address>
            </div>
            </footer></body></html>`
    return htmlPage
}



http.createServer(function (req, res) {
    var today = new Date();
    var d = today.toISOString().substring(0, 16)
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    console.log(req.method + " " + req.url + " " + d)

    if (static.recursoEstatico(req)) {
        static.sirvoRecursoEstatico(req, res)
    }
    else {
        switch (req.method) {
            case "GET":
                if (req.url == "/" || req.url == "/tarefas") {
                    axios.get("http://localhost:3000/tarefas")
                        .then(resp => {
                            var tarefas = resp.data
                            res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                            res.write(generatePage(tarefas, d))
                            res.end()
                        })
                        .catch(function (error) {
                            res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                            res.write("<p>Não foi possível obter a lista de tarefas...")
                            res.end()
                        })
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                    res.write("<p>" + req.method + " " + req.url + " não suportado neste serviço.</p>")
                    res.end()
                }
                break
            case "POST":
                var p = req.url.split('/')
                if (p[2] == 'insert') {
                    recuperaInfo(req, resul => {
                        console.log("POST: " + JSON.stringify(resul))
                        resul['status'] = 'realizar'
                        resul['data_criada'] = date
                        axios.post("http://localhost:3000/tarefas", resul)
                        axios.get("http://localhost:3000/tarefas")
                            .then(resp => {
                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                res.write(generatePage(resp.data, d))
                                res.end()
                            })
                            .catch(function (error) {
                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                res.write("<p>Não foi possível obter a lista de tarefas...")
                                res.end()
                            })
                    })
                }
                else if (p[3]) {
                    switch (p[3]) {
                        case "edit":
                            if (p[4] == 'confirm') {
                                console.log("EDIT confirmed")
                                recuperaInfo(req, resul => {
                                    resul['id'] = p[2]
                                    resul['status'] = "realizar"
                                    resul['data_criada'] = date
                                    console.log("EDIT: " + JSON.stringify(resul))
                                    axios.put("http://localhost:3000/tarefas/" + p[2], resul)
                                        .then(axios.get("http://localhost:3000/tarefas")
                                            .then(resp => {
                                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                                res.write(generatePage(resp.data, d))
                                                res.end()
                                            })
                                            .catch(function (error) {
                                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                                res.write("<p>Não foi possível obter a lista de tarefas...")
                                                res.end()
                                            })
                                        ).catch(function (error) {
                                            console.log(error)
                                        })

                                })
                            }
                            else {
                                console.log("EDIT requested")
                                var idT = p[2]
                                axios.get("http://localhost:3000/tarefas")
                                    .then(resp => {
                                        axios.get("http://localhost:3000/tarefas/" + idT)
                                            .then(tarefa => {
                                                res.writeHead(200, { 'Content-Type': 'text/html;charset-utf-8' })
                                                res.write(generateEditPage(resp.data, tarefa.data, d))
                                                res.end()
                                            })
                                    })
                            }
                            break
                        case "check":
                            console.log("TASK DONE requested")
                            var idT = p[2]
                            axios.get("http://localhost:3000/tarefas/" + idT)
                                .then(tarefa => {
                                    data = tarefa.data
                                    data['status'] = "realizada"
                                    axios.put("http://localhost:3000/tarefas/" + idT, data)
                                        .then(axios.get("http://localhost:3000/tarefas")
                                            .then(resp => {
                                                res.writeHead(200, { 'Content-type': 'text/html;charset=utf-8' })
                                                res.write(generatePage(resp.data, d))
                                                res.end()
                                            })
                                        ).catch(function (error) {
                                            console.log(error)
                                        })

                                })
                            break
                        case "delete":
                            console.log('DELETE TASK requested')
                            var idT = p[2]
                            axios.delete("http://localhost:3000/tarefas/" + idT)
                            axios.get("http://localhost:3000/tarefas")
                                .then(resp => {
                                    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                    res.write(generatePage(resp.data, d))
                                    res.end()
                                })
                            break
                    }
                }
                else {
                    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                    console.log("URL recebido: " + req.url)
                    res.write('<p>Recebi um POST não suportado.</p>')
                    res.write('<p><a href="/">Voltar</a></p>')
                    res.end()
                }
                break
            default:
                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                res.write("<p>" + req.method + " não suportado neste serviço.</p>")
                res.end()
                break
        }

    }
}).listen(7777)
console.log('Servidor à escuta na porta 7777...')