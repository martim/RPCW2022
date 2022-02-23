const http = require('http')
const fs = require('fs')
const url = require('url')
const path = require('path')

    file_server = http.createServer(function (req, res) {
        const date = new Date().toISOString().substring(0,16).replace("T", " ")
        const page_url = url.parse(req.url, true).pathname
        const page_name = path.parse(page_url).name
        const page_dirname = path.parse(page_url).dir
        console.log(req.method + " " + req.url + " " + date)
        if(page_dirname == "/" && (page_name == 'filmes' || page_name == "atores")) {
            fs.readFile('./arquivo/' + page_name + '/index.html', function (err, data) {
                if(err){
                    fs.readFile('./404.html', function(err, data) {
                        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                        res.end(data);
                    })
                }
                else {
                    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                    res.end(data)
                }
            })
        }
        else {
            if(page_dirname == "/atores" || page_dirname == "/filmes"){
                fs.readFile('./arquivo' + page_dirname + '/' + page_name + '.html', function (err, data) {
                    if(err){
                        fs.readFile('./404.html', function(err, data) {
                            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                            res.end(data);
                        })
                    }
                    else {
                        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'})
                        res.end(data)
                    }
                })
            }
            else{
                fs.readFile('./404.html', function(err, data) {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(data);
                })
            }
        }
    })

    file_server.listen(7777)
    console.log('Servidor web à escuta na porta 7777')