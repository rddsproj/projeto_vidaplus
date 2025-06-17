const express = require('express')
const router = express.Router()
const logController = require('../Controllers/logController.js')
const {authToken, verificarToken} = require('../middlewares/authMiddleware')

router.get('/listar', authToken, logController.listarTodos)
router.get('/listar/usuario/:idUsuario', authToken, logController.listarPorUsuario)
router.post('/listar/acao/:acao', authToken, logController.listarPorAcao)


module.exports = router