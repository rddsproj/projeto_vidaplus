const express = require('express')
const router = express.Router()
const logController = require('../Controllers/logController.js')
const {authToken, verificarToken} = require('../middlewares/authMiddleware')

router.get('/listar', authToken, logController.listarTodos)
router.get('/usuario/:idUsuario', authToken, logController.listarPorUsuario)
router.get('/codigo/:codigo', authToken, logController.listarPorAcao)


module.exports = router