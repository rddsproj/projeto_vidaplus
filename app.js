const express = require('express')
const app = express()

require('dotenv').config()
require('./db/conn');//conecta com o banco da dados

const createAdmin = require('./utils/createAdmin.js')//verifica se já tem algum admin
createAdmin()

//Middlawares
app.use(
  express.urlencoded({
    extended: true,
  }),
)
app.use(express.json())
app.use(express.static('public'))

//Rotas
const usuarioRoutes = require("./Routes/usuarioRoutes.js")
const loginRoutes = require("./Routes/loginRoutes.js")
const consultaRoutes = require("./Routes/consultaRoutes.js")
const logRoutes = require("./Routes/logRoutes.js")
const prontuarioRoutes = require("./Routes/prontuarioRoutes.js")
const receitaRoutes = require("./Routes/receitaRoutes.js")
const internacaoRoutes = require("./Routes/internacaoRoutes.js")
const relatorioRoutes = require("./Routes/relatorioRoutes.js")
const leitoRoutes = require("./Routes/leitoRoutes.js")


app.use('/relatorio', relatorioRoutes)
app.use('/internacao', internacaoRoutes)
app.use('/leito', leitoRoutes)
app.use('/consulta', consultaRoutes)
app.use('/prontuario', prontuarioRoutes)
app.use('/receita', receitaRoutes)
app.use('/login', loginRoutes)
app.use('/usuario', usuarioRoutes)
app.use('/log', logRoutes)
app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000')
})