const http = require('http')
const axios = require('axios')
const fs = require('fs')
const static = require('./static.js')
const { parse } = require('querystring')

// Retrieves student info from request body
function recuperaInfo(request, callback) {
    if (request.headers['content-type'] == 'application/x-www-form-urlencoded') {
        let body = ''
        request.on('data', bloco => {
            body += bloco.toString()
        })
        request.on('end', () => {
            console.log(body)
            callback(parse(body))
        })
    }
}

function generatePage(tarefas, d) {
    var tarefas_realizadas = []
    var tarefas_por_realizar = []
    tarefas.forEach(
        t => {
            if (t.status == 'realizar') {
                tarefas_por_realizar.push(t)
            } else {
                tarefas_realizadas.push(t)
            }
        }
    )
    // console.log(tarefas_por_realizar)
    let htmlPage = `
    <html>
        <head>
            <title>ToDo List</title>
            <meta charset="utf-8"/>
            <link rel="icon" href="todolist.png"/>
            <link rel="stylesheet" href="w3.css"/>
            <link rel="stylesheet" href="font.css"/>
        </head>
        <body>
            <div class="w3-container w3-teal">
                ToDo List
            </div>

            <form class="w3-container" action="/tarefas/insert" method="POST">
                <label class="w3-text-teal"><b>Tarefa</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" name="tarefa">

                <label class="w3-text-teal"><b>Tipo</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" name="tipo">

                <label class="w3-text-teal"><b>Data Deadline</b></label>
                <input class="w3-input w3-border w3-light-grey" type="date" name="deadline">

                <label class="w3-text-teal"><b>Responsável</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" name="target">
          
                <input class="w3-btn w3-blue-grey" type="submit" value="Registar"/>
                <input class="w3-btn w3-blue-grey" type="reset" value="Limpar valores"/> 
            </form>
`
    htmlPage += `
            <div class="w3-row w3-teal">
                <div class="w3-col l6 6 w3-center">
                    Tarefas Por Realizar`

    keys = ['Tarefa', 'Tipo', 'Criada Em', 'Deadline', 'Responsável']

    htmlPage += '<table class="w3-table-all w3-centered w3-light-grey">\n<thead>\n<tr>'
    for (let i = 0; i < keys.length; i++) {
        htmlPage += `<th>${keys[i]}</th>`
    }
    htmlPage += '</tr></thead>'

    tarefas_por_realizar.forEach(t => {
        htmlPage += `
                    <tr>
                        <td>${t.tarefa}</td>
                        <td>${t.tipo}</td>
                        <td>${t.data_criada}</td>
                        <td>${t.deadline}</td>
                        <td>${t.target}</td>
                        <td>
                            <form action="/tarefas/${t.id}/check" method="POST">
                                <input class="w3-circle w3-round-large w3-light-green" type="submit" value="Done"/>
                            </form>
                        </td>
                        <td>
                            <form action="/tarefas/${t.id}/edit" method="POST">
                                <input class="w3-circle w3-round-large w3-light-green" type="submit" value="Edit"/>
                            </form>
                        </td>
                    </tr>
                `
    })
    htmlPage += `
                </table>
                </div>
`

    htmlPage += `
                <div class="w3-col l6 6 w3-center">
                    Tarefas Realizadas
`
    htmlPage += '<table class="w3-table-all w3-centered w3-light-grey">\n<thead>\n<tr>'
    for (let i = 0; i < keys.length; i++) {
        htmlPage += `<th>${keys[i]}</th>`
    }
    htmlPage += '</tr></thead>'

    tarefas_realizadas.forEach(t => {
        htmlPage += `
                    <tr>
                        <td>${t.tarefa}</td>
                        <td>${t.tipo}</td>
                        <td>${t.data_criada}</td>
                        <td>${t.deadline}</td>
                        <td>${t.target}</td>
                        <td>
                        <form action="/tarefas/${t.id}/delete" method="POST">
                            <input class="w3-circle w3-round-large w3-red" type="submit" value="Delete"/>
                        </form>
                    </td>
                    </tr>
                `
    })

    htmlPage += `
        </div></table>
    `

    htmlPage += `
        </body>
    </html>
    `
    return htmlPage
}

function generateEditPage(tarefas, tarefa, d) {
    var tarefas_realizadas = []
    var tarefas_por_realizar = []
    tarefas.forEach(
        t => {
            if (t.status == 'realizar') {
                tarefas_por_realizar.push(t)
            } else {
                tarefas_realizadas.push(t)
            }
        }
    )
    // console.log(tarefas_por_realizar)
    let htmlPage = `
    <html>
        <head>
            <title>ToDo List</title>
            <meta charset="utf-8"/>
            <link rel="icon" href="todolist.png"/>
            <link rel="stylesheet" href="w3.css"/>
            <link rel="stylesheet" href="font.css"/>
        </head>
        <body>
            <div class="w3-container w3-teal">
                ToDo List
            </div>

            <form class="w3-container" action="/tarefas/${tarefa.id}/edit/confirm" method="POST">
                <label class="w3-text-teal"><b>Tarefa</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" value="${tarefa.tarefa}" name="tarefa">

                <label class="w3-text-teal"><b>Tipo</b></label>
                <input class="w3-input w3-border w3-light-grey" value=${tarefa.tipo} type="text" name="tipo">

                <label class="w3-text-teal"><b>Data Deadline</b></label>
                <input class="w3-input w3-border w3-light-grey" type="date" value="${tarefa.deadline}" name="deadline">

                <label class="w3-text-teal"><b>Responsável</b></label>
                <input class="w3-input w3-border w3-light-grey" type="text" value="${tarefa.target}" name="target">
          
                <input class="w3-btn w3-blue-grey" type="submit" value="Confirmar"/>
                <input class="w3-btn w3-blue-grey" type="reset" value="Limpar valores"/> 
            </form>
`
    htmlPage += `
            <div class="w3-row w3-teal">
                <div class="w3-col l6 6 w3-center">
                    Tarefas Por Realizar`

    keys = ['Tarefa', 'Tipo', 'Criada Em', 'Deadline', 'Responsável']

    htmlPage += '<table class="w3-table-all w3-centered w3-light-grey">\n<thead>\n<tr>'
    for (let i = 0; i < keys.length; i++) {
        htmlPage += `<th>${keys[i]}</th>`
    }
    htmlPage += '</tr></thead>'

    tarefas_por_realizar.forEach(t => {
        htmlPage += `
                    <tr>
                        <td>${t.tarefa}</td>
                        <td>${t.tipo}</td>
                        <td>${t.data_criada}</td>
                        <td>${t.deadline}</td>
                        <td>${t.target}</td>
                        <td>
                            <form action="/tarefas/${t.id}/check" method="POST">
                                <input class="w3-circle w3-round-large w3-light-green" type="submit" value="Done"/>
                            </form>
                        </td>
                        <td>
                            <form action="/tarefas/${t.id}/edit" method="POST">
                                <input class="w3-circle w3-round-large w3-light-green" type="submit" value="Edit"/>
                            </form>
                        </td>
                    </tr>
                `
    })
    htmlPage += `
                </table>
                </div>
`

    htmlPage += `
                <div class="w3-col l6 6 w3-center">
                    Tarefas Realizadas
`
    htmlPage += '<table class="w3-table-all w3-centered w3-light-grey">\n<thead>\n<tr>'
    for (let i = 0; i < keys.length; i++) {
        htmlPage += `<th>${keys[i]}</th>`
    }
    htmlPage += '</tr></thead>'

    tarefas_realizadas.forEach(t => {
        htmlPage += `
                    <tr>
                        <td>${t.tarefa}</td>
                        <td>${t.tipo}</td>
                        <td>${t.data_criada}</td>
                        <td>${t.deadline}</td>
                        <td>${t.target}</td>
                        <td>
                        <form action="/tarefas/${t.id}/delete" method="POST">
                            <input class="w3-circle w3-round-large w3-red" type="submit" value="Delete"/>
                        </form>
                    </td>
                    </tr>
                `
    })

    htmlPage += `
        </div></table>
    `

    htmlPage += `
        </body>
    </html>
    `
    return htmlPage

}


var todolistServer = http.createServer(function (req, res) {
    // Logger: que pedido chegou e quando
    var today = new Date();
    var d = today.toISOString().substring(0, 16)
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    console.log(req.method + " " + req.url + " " + d)

    if (static.recursoEstatico(req)) {
        static.sirvoRecursoEstatico(req, res)
    } else {
        // Tratamento do pedido
        switch (req.method) {
            case "GET":
                // GET /alunos --------------------------------------------------------------------
                if ((req.url == "/" || req.url == "/tarefas")) {
                    axios.get("http://localhost:3000/tarefas")
                        .then(response => {
                            var tarefas = response.data
                            // console.log(tarefas)
                            res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                            res.write(generatePage(tarefas, d))
                            res.end()
                        })
                        .catch(function (erro) {
                            // console.log(erro)
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
                var parts = req.url.split('/')
                // console.log(parts)
                if (parts[2] == 'insert') {
                    recuperaInfo(req, resultado => {
                        console.log("POST de tarefa " + JSON.stringify(resultado))
                        resultado['status'] = 'realizar'
                        resultado['data_criada'] = date
                        axios.post("http://localhost:3000/tarefas", resultado)
                        axios.get("http://localhost:3000/tarefas")
                            .then(response => {
                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                // console.log(response.data)
                                res.write(generatePage(response.data, d))
                                res.end()
                            })
                            .catch(function (erro) {
                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                res.write("<p>Não foi possível obter a lista de tarefas...")
                                res.end()
                            })
                    })
                }
                else if (parts[3]) {
                    switch (parts[3]) {
                        case "edit":
                            if (parts[4] == 'confirm') {
                                console.log('EDIT confirmed')
                                recuperaInfo(req, resultado => {
                                    console.log("EDIT de tarefa " + JSON.stringify(resultado))
                                    resultado['id'] = parts[2]
                                    resultado['status'] = "realizar"
                                    resultado['data_criada'] = date
                                    axios.delete("http://localhost:3000/tarefas/" + parts[2])
                                    axios.post("http://localhost:3000/tarefas", resultado)
                                    axios.get("http://localhost:3000/tarefas")
                                        .then(response => {
                                            res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                            // console.log(response.data)
                                            res.write(generatePage(response.data, d))
                                            res.end()
                                        })
                                        .catch(function (erro) {
                                            res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                            res.write("<p>Não foi possível obter a lista de tarefas...")
                                            res.end()
                                        })
                                })
                            }
                            else {
                                console.log('EDIT requested')
                                var idTarefa = parts[2]
                                axios.get("http://localhost:3000/tarefas")
                                    .then(resp => {
                                        axios.get("http://localhost:3000/tarefas/" + idTarefa)
                                            .then(tarefa => {
                                                res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                                // console.log(response.data)
                                                res.write(generateEditPage(resp.data, tarefa.data))
                                                res.end()
                                            })
                                    })
                            }
                            break
                        case "check":
                            console.log('TASK DONE requested')
                            var idTarefa = parts[2]
                            axios.get("http://localhost:3000/tarefas/" + idTarefa)
                                .then(tarefa => {
                                    data = tarefa.data
                                    data['status'] = "realizada"
                                    axios.delete("http://localhost:3000/tarefas/" + idTarefa)
                                    axios.post("http://localhost:3000/tarefas", data)
                                    axios.get("http://localhost:3000/tarefas")
                                        .then(resp => {
                                            res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                            // console.log(response.data)
                                            res.write(generatePage(resp.data))
                                            res.end()
                                        })
                                })
                            break
                        case "delete":
                            console.log('DELETE TASK requested')
                            var idTarefa = parts[2]
                            axios.delete("http://localhost:3000/tarefas/" + idTarefa)
                            axios.get("http://localhost:3000/tarefas")
                                .then(resp => {
                                    res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
                                    res.write(generatePage(resp.data))
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
        }
    }
})

todolistServer.listen(7777)
console.log('Servidor à escuta na porta 7777...')