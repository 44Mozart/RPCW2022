
const { default: axios } = require('axios')
var http = require('http')
var url = require('url')

function generateMainPage() {
    page = '<!DOCTYPE html>\n<html lang="pt">\n<head>\n<meta charset="UTF-8">\n' +
        '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
        '<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">\n' +
        '<title>TPC3</title>\n' +
        '</head>\n<body class="w3-container w3-margin-top">\n' +
        '<div class = "w3-card"><a href="http://localhost:4000/alunos">Lista de alunos</a></div>\n' +
        '<br>\n<div class = "w3-card"><a href="http://localhost:4000/cursos">Lista de cursos</a></div>\n' +
        '<br>\n<div class = "w3-card"><a href="http://localhost:4000/instrumentos">Lista de instrumentos</a></div>\n '
    return page
}

function getAlunos() {
    return axios.get("http://localhost:3000/alunos")
        .then(resp => {
            data = resp.data
            return data
        })
}

function getCursos() {
    return axios.get("http://localhost:3000/cursos")
        .then(resp => {
            data = resp.data
            return data
        })
}

function getInstrumentos() {
    return axios.get("http://localhost:3000/instrumentos")
        .then(resp => {
            data = resp.data
            return data
        })
}

function writeAlunos(data) {
    str = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>Alunos</title>
    </head>
    <body>
        <table class="w3-table-all w3-hoverable">
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Curso</th>
            <th>Instrumento</th>
        </tr>
    `;
    data.forEach(ele => {
        str += `<tr>
                    <td>${ele.id}</td>
                    <td>${ele.nome}</td>
                    <td>${ele.curso}</td>
                    <td>${ele.instrumento}</td>
                </tr>`
    })
    str += `</table>
            </body></html>`
    return str
}

function writeCursos(data) {
    str = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>Cursos</title>
    </head>
    <body>
        <table class="w3-table-all w3-hoverable">
        <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Duração</th>
            <th>Instrumento</th>
        </tr>
    `;
    data.forEach(ele => {
        str += `<tr>
                    <td>${ele.id}</td>
                    <td>${ele.designacao}</td>
                    <td>${ele.duracao}</td>
                    <td>${ele.instrumento["#text"]}</td>
                </tr>`
    })
    str += `</table>
            </body></html>`
    return str
}

function writeInstrumentos(data) {
    str = `
    <!DOCTYPE html>
    <html lang="pt">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <title>Instrumentos</title>
    </head>
    <body>
        <table class="w3-table-all w3-hoverable">
        <tr>
            <th>ID</th>
            <th>Nome</th>
        </tr>
    `;
    data.forEach(ele => {
        str += `<tr>
                    <td>${ele.id}</td>
                    <td>${ele["#text"]}</td>
                </tr>`
    })
    str += `</table>
            </body></html>`
    return str
}

http.createServer(function (req, res) {
    var d = new Date().toISOString().substring(0, 16)
    console.log(req.method + " " + req.url + " " + d)
    var myurl = url.parse(req.url, true).pathname
    if (myurl == "/") {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
        res.write(generateMainPage())
        res.end()
    }
    else if (myurl == "/alunos") {
        getAlunos()
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.write(writeAlunos(data))
                res.end()
            })
    }
    else if (myurl == "/cursos") {
        getCursos()
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.write(writeCursos(data))
                res.end()
            })
    }
    else if (myurl == "/instrumentos") {
        getInstrumentos()
            .then(data => {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.write(writeInstrumentos(data))
                res.end()
            })
    }
    else {
        res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' })
        res.end("<p>Rota não suportada" + req.url + "</p>")
    }
}).listen(4000)
console.log('Servidor à escuta na porta 4000...')