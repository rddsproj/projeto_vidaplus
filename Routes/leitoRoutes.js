const express = require('express')
const router = express.Router()
const {authToken} = require('../middlewares/authMiddleware')
const leitoController = require('../Controllers/leitoController')


router.post('/criar', authToken, leitoController.criarLeito)
router.get('/listar', authToken, leitoController.listarLeitos)
router.delete('/deletar/:numero', authToken, leitoController.deletarLeito)



module.exports = router