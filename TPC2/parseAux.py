import json
with open("cinemaATP.json", encoding='utf-8') as file:
    data = json.load(file)

i = 1
for ele in data:
    numero = str(i)
    nome = "./HTML/f" + numero + ".html"
    f = open(nome, "w")
    f.write('<!DOCTYPE html>\n<html lang="pt">\n<head>\n <meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">\n<link rel="stylesheet" href="../CSS/app.css">\n')
    f.write('<title>' + ele['title'] + '</title>\n</head>')
    f.write('<body>\n<div class="w3-bar w3-center"><h1>'+ele['title'] +
            '</h1></div>\n<div class="w3-container w3-margin-left"><h3>Ano de Lançamento: '+str(ele['year']) + '</h3>\n<h4>Elenco:</h4>\n')
    f.write('<ul>\n')
    for c in ele['cast']:
        f.write('<li>'+c+'</li>')
    f.write('</ul>\n<h3>Genéro do filme:</h3>\n<ul>\n')
    for g in ele['genres']:
        f.write('<li>' + g + '</li>')
    f.write('</ul>\n</div></body>\n')
    i += 1
