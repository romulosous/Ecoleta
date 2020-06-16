//1º passo 
const express = require("express") // esse require é tipo uma caixinha magica, que faço um pedido, e me manda
const server = express()

// 6º passo -> pegar o banco de dados
const db = require("./database/db")


// 4º Passo ->
// configurar pasta publica
server.use(express.static("public"))


// habilitar o uso do req.body na nossa aplicação
server.use(express.urlencoded({extended: true}))

// 5º Passo ->
// Utilizando template engine

const nunjucks = require("nunjucks")
nunjucks.configure("src/views", {
    express: server,
    noCache: true
})


// 3º Passo -> 
// configurar caminhos da minha aplicação
// página inicial
// req: Requisição
// res: Respostas
server.get("/", (req, res) => {
    // res.render(__dirname + "/views/index.html")
    // depois de configurar o template engine, eu posso fazer assim:
    return res.render("index.html", {
        title: "Um titulo"
    })
})

server.get("/create-point", (req, res) => {

    // req.query: Query Strings da nossa url
    // console.log(req.query)


    return res.render("create-point.html")
})

server.post("/savepoint", (req, res) => {

    // req.body: o corpo do nosso formulário
    // console.log(req.body)

    // inserir dados no banco de dados

    const query = `
        INSERT INTO places (
            image,
            name,
            address,
            address2,
            state,
            city,
            items
        ) VALUES (?,?,?,?,?,?,?);
    `

    const values = [
        req.body.image,
        req.body.name,
        req.body.address,
        req.body.address2,
        req.body.state,
        req.body.city,
        req.body.items
    ]

    function afterInsertData(err){
        if(err){
            console.log(err)
            return res.send("Erro no cadastro!")
        }

        console.log("Cadastrado com sucesso")
        console.log(this)

        return res.render("create-point.html", { saved: true})
    }

    db.run(query, values, afterInsertData)



})

server.get("/search", (req, res) => {

    const search = req.query.search

    if(search == ""){
        // pesquisa vazia
        return res.render("search-results.html", {total: 0})
    }

    //pegar os dados do banco de dados
    db.all(`SELECT * FROM places WHERE city LIKE '%${search}%'`, function(err, rows){
        if(err){
            return console.log(err)
        }

        // console.log(rows)

        const total = rows.length

        // mostrar a pagina html com os dados do banco de dados
        return res.render("search-results.html", {places: rows, total})

    })
})

// 2º Passo -> Ligar o servidor
server.listen(5000)