const http = require('http')
const url = require('url')
const axios = require('axios')

function generateMainPage() {
    main_page = `<!DOCTYPE html>
    <html>
        <head>
            <title>Escola de Música</title>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        </head>
        <body>
            <div class="w3-container w3-padding-16 w3-center w3-hoverable">
                <h1><b>Escola de Música</b></h1>
                <div class="w3-container w3-padding-16 w3-center w3-hoverable"></div>
                    <ul class="w3-ul w3-xlarge">
                        <li><a href="http://localhost:4000/cursos" class="w3-button w3-teal  w3-hover-teal">Cursos Disponíveis</a></li>
                        <li><a href="http://localhost:4000/alunos" class="w3-button w3-teal  w3-hover-teal">Alunos Inscritos</a></li>
                        <li><a href="http://localhost:4000/instrumentos" class="w3-button w3-teal w3-hover-teal">Lista de Instrumentos</a></li>
                    </ul>
                </div>
            </div>
        </body>
    </html>`
    return main_page
}

function generateTablePage(keys,data,titulo) {
    table_page = `<!DOCTYPE html>
    <html>
        <head>
            <title>Escola de Música</title>
            <meta charset="UTF-8">
            <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        </head>
        <body>
            <div class="w3-container w3-padding-16 w3-responsive w3-center" id="species">
                <h1><b>Lista de ${titulo}</b></h1>
                <table class="w3-table w3-hoverable">
                    <tr class="w3-teal">
                    `
    keys.forEach(key => {
        table_page += ` <th class="w3-center">${key}</th>
                    `
    });
    data.forEach(a =>{
        table_page += `<tr class="w3-hover-teal">
                        `
        for(var key in a){
            table_page += `<td class="w3-center">${a[key]}</td>
            `
        }
        table_page += `</tr>
        `
    })
    table_page +=`                
                </table>
                <br>
                <a href="http://localhost:4000/" class="w3-button w3-teal w3-border-black">Voltar ao Início</a>
            </div>
        </body>
    </html>`
    
    return table_page
}

    server = http.createServer(function (req, res) {
        const date = new Date().toISOString().substring(0,16).replace("T", " ")
        const url_parsed =  url.parse(req.url, true)
        const page_url = url_parsed.pathname
        console.log(req.method + " " + req.url + " " + date)

        switch (page_url) {
            case ("/"):
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                    res.write(generateMainPage())
                    res.end()
                break;
        
            case ("/alunos"):
                axios.get('http://localhost:3000'+ url_parsed.path)
                     .then(function (resp) {
                         var alunos = resp.data
                         res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                         res.write(generateTablePage(Object.keys(alunos[0]),alunos,"Alunos"))
                         res.end()
                     })
                     .catch(function (error) {
                        console.log(error)
                     })
                break;
            
            case ("/instrumentos"):
                axios.get('http://localhost:3000'+ url_parsed.path)
                     .then(function (resp) {
                         var instrumentos = resp.data
                         res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                         res.write(generateTablePage(["id","nome"],instrumentos,"Instrumentos"))
                         res.end()
                     })
                     .catch(function (error) {
                        console.log(error)
                     })
                break;

            case ("/cursos"):
                axios.get('http://localhost:3000'+ url_parsed.path)
                     .then(function (resp) {
                         var cursos = resp.data
                         cursos.forEach(c => {
                             c["id Instrumento"] = c["instrumento"]["id"]
                             c["Nome Instrumento"] = c["instrumento"]["#text"]
                             delete c.instrumento
                         })
                         res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
                         res.write(generateTablePage(Object.keys(cursos[0]), cursos, "Cursos"))
                         res.end()
                     })
                     .catch(function (error) {
                        console.log(error)
                     })
                break;

            default:
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
                res.end("<pre>Rota não suportada: " + req.url + "</pre>")
                break;
        }
    })

    server.listen(4000)
    console.log('Servidor web à escuta na porta 4000')