import json
with open("cinemaATP.json", encoding='utf-8') as file:
    data = json.load(file)
nome = "./HTML/index.html"
f = open(nome, "w")
f.write('<!DOCTYPE html>\n<html lang="pt">\n<head>\n <meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">\n<link rel="stylesheet" href="../CSS/app.css">\n\n')
f.write('<title>Filmes</title>\n</head>')
f.write('<body>\n<div class="w3-bar w3-center">\n<h1>Filmes</h1>\n</div>\n<div class="w3-container w3-margin-left">')
i = 1
for ele in data:
    numero = str(i)
    f.write('<p><a href="http://localhost:7777/filmes/f' + numero +
            '">' + ele['title'] + '</a>\n</p>')
    i += 1
f.write('</div></body>\n')
