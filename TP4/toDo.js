var http = require('http')
var axios = require('axios')
var fs = require('fs')
var static = require('./static.js')
var {parse} = require('querystring')

function recuperaInfo(request, callback){
    if(request.headers['content-type'] == 'application/x-www-form-urlencoded'){
        let body = ''
        request.on('data', bloco => {
            body += bloco.toString()
        })
        request.on('end', ()=>{
            callback(parse(body))
        })
    }
}

function makeForm(){
    return `
            <div class="w3-container w3-padding-16 w3-light-grey">
                <form class="w3-container" action="/tasks" method="POST">
                    <label class="w3-text-orange"><b>Task:</b></label>
                    <input class="w3-input w3-border w3-light-grey" type="text" name="task">
                    <br>
                    <label class="w3-text-orange"><b>Task Type:</b></label>
                    <input class="w3-input w3-border w3-light-grey" type="text" name="type">
                    <br>
                    <label class="w3-text-orange"><b>Responsible:</b></label>
                    <input class="w3-input w3-border w3-light-grey" type="text" name="owner">
                    <br>
                    <label class="w3-text-orange"><b>Deadline:</b></label>
                    <input class="w3-input w3-border w3-light-grey" type="text" name="deadline">
                    <br>
                    <input class="w3-btn w3-orange" type="submit" value="Register"/>
                    <input class="w3-btn w3-orange" type="reset" value="Clear"/> 
                </form>
            </div>
    `
}

function makeToDo(tasks) {
    var page = `
    <div class="w3-half w3-container w3-padding-16">
        <h3 class="w3-center w3-orange">Tasks To-Do</h3>
        <ul class="w3-ul w3-card-4">
    `
    tasks.forEach(task => {
        page += `
        <li class="w3-bar">
            <span class="w3-right">
                <div class="w3-cell-row">
                    <div class="w3-cell">
                        <form action="/tasks/${task.id}/done" method="POST">
                            <button class="w3-btn w3-orange" type="submit">Done</button>
                        </form>
                    </div>
                    <div class="w3-cell">
                        <form action="/tasks/${task.id}/delete" method="POST">
                            <button class="w3-btn w3-orange" type="submit">Delete</button>
                        </form>
                    </div>
                </div>
            </span>
            <div class="w3-bar-item">
                <span>${task.type} - ${task.task}</span>
                <br>
                <span>${task.owner}</span>
                <br>
                <span>Until ${task.deadline}</span>
            </div>    
        </li>
        `
    })

    page += `
    </ul>
    </div>
    `
    return page
}

function makeDone(tasks){
    var page = `
    <div class="w3-half w3-container w3-padding-16">
        <h3 class="w3-center w3-orange">Tasks Done</h3>
        <ul class="w3-ul w3-card-4">
    `
    tasks.forEach(task => {
        page += `
        <li class="w3-bar">
            <span class="w3-right">
                <div class="w3-cell-row">
                    <div class="w3-cell">
                        <form action="/tasks/${task.id}/undo" method="POST">
                            <button class="w3-btn w3-orange" type="submit">Undo</button>
                        </form>
                    </div>
                    <div class="w3-cell">
                        <form action="/tasks/${task.id}/delete" method="POST">
                            <button class="w3-btn w3-orange" type="submit">Delete</button>
                        </form>
                    </div>
                </div>
            </span>
            <div class="w3-bar-item">
                <span>${task.type} - ${task.task}</span>
                <br>
                <span>${task.owner}</span>
                <br>
                <span>Until ${task.deadline}</span>
            </div>    
        </li>
        `
    })

    page += `
    </ul>
    </div>
    `
    return page
}

function makePage(todo, done, form) {
    return `
    <!DOCTYPE html>
<html>
    <head>
        <title>To-Do</title>
        <meta charset="UTF-8">
        <link rel="icon" href="favicon.png"/>
        <link rel="stylesheet" href="w3.css"/>
    </head>
    <body>
        <div class="w3-container w3-padding-16">
            <div class="w3-container w3-center w3-orange">
                <h1><b>To-Do List</b></h1>
            </div>
    ` + form + `
    <div class="w3-row w3-container w3-padding-16">`
    + todo + done + `
    </div>
        </div>
    </body>
</html>`
}

var toDoServer = http.createServer(function (req, res) {
    var d = new Date().toISOString().substring(0,16).replace("T", " ")
    console.log(req.method + " " + req.url + " " + d)

    if(static.recursoEstatico(req)){
        static.sirvoRecursoEstatico(req,res)
    } else {
        switch(req.method){
            case "GET": 
                if(req.url == "/"){
                    formTasks = makeForm()
                    axios.get("http://localhost:3000/tasks?status=todo")
                        .then(respToDo => {
                            var toDoTasks = makeToDo(respToDo.data)
                            axios.get("http://localhost:3000/tasks?status=done")
                                 .then(respDone => {
                                    var doneTasks = makeDone(respDone.data)
                                    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                                    res.write(makePage(toDoTasks, doneTasks, formTasks))
                                    res.end()
                                 }).catch(function(erro){
                                    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                                    res.write("<p>Database error</p>")
                                    res.end()
                                 })
                            
                        })
                        .catch(function(erro){
                            res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write("<p>Database error</p>")
                            res.end()
                        })
                }
                else if(req.url == "/w3.css"){
                    fs.readFile("public/w3.css", function(erro, dados){
                        if(!erro){
                            res.writeHead(200, {'Content-Type': 'text/css;charset=utf-8'})
                            res.write(dados)
                            res.end()
                        }
                    })
                }
                else{
                    res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                    res.write("<p>" + req.method + " " + req.url + " não suportado neste serviço.</p>")
                    res.end()
                }
                break
            case "POST":
                if(req.url == "/tasks"){
                    recuperaInfo(req, resultado =>{
                        resultado['created'] = d.substring(0,10)
                        resultado['status'] = 'todo'
                        axios.post("http://localhost:3000/tasks", resultado)
                             .then(resp => {
                                res.writeHead(301, {'Location': '/'})
                                res.end()
                            })
                            .catch(erro => {
                                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                                res.write("<p>Erro no POST:" + erro + '</p>')
                                res.end()
                            })
                    })
                }

                if(/\/tasks\/[0-9]+\/delete/.test(req.url)){
                    var id = req.url.split('/')[2]
                    axios.delete("http://localhost:3000/tasks/" + id).then(resp => {
                        res.writeHead(301, {'Location': '/'})
                        res.end()
                    })
                    .catch(erro => {
                        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                        res.write("<p>Erro no DELETE: " + erro + "</p>")
                        res.end()  
                    })
                }

                if(/\/tasks\/[0-9]+\/do/.test(req.url)){
                    var id = req.url.split('/')[2]
                    axios.get("http://localhost:3000/tasks/" + id).then(resp => {
                        var task = resp.data
                        task['status'] = 'done'
                        axios.put('http://localhost:3000/tasks/' + id, task).then(resp => {
                            res.writeHead(301, {'Location': '/'})
                            res.end()
                        }).catch(erro => {
                            res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write("<p>Erro no PUT: " + erro + "</p>")
                            res.end()  
                        })
                    }).catch(erro => {
                        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                        res.write("<p>Erro no GET: " + erro + "</p>")
                        res.end()  
                    })
                }

                if(/\/tasks\/[0-9]+\/undo/.test(req.url)){
                    var id = req.url.split('/')[2]
                    axios.get("http://localhost:3000/tasks/" + id).then(resp => {
                        var task = resp.data
                        task['status'] = 'todo'
                        axios.put('http://localhost:3000/tasks/' + id, task).then(resp => {
                            res.writeHead(301, {'Location': '/'})
                            res.end()
                        }).catch(err => {
                            res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                            res.write("<p>Erro no PUT: " + err + "</p>")
                            res.end()  
                        })
                    }).catch(err => {
                        res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                        res.write("<p>Erro no GET: " + err + "</p>")
                        res.end()  
                    })
                }

                break
            default: 
                res.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'})
                res.write("<p>" + req.method + " não suportado neste serviço.</p>")
                res.end()
        }
    }
})

toDoServer.listen(4000)
console.log('Server listening at port 4000...')