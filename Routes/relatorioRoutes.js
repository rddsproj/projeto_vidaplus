const express = require('express')
const router = express.Router()
const relatorioController = require('../Controllers/relatorioController.js')
const {authToken, verificarToken} = require('../middlewares/authMiddleware.js')

router.get('/consulta', authToken, relatorioController.relatorioConsultas)
router.get('/internacao', authToken, relatorioController.relatorioInternacao)
router.get('/leito', authToken, relatorioController.relatorioLeito)


module.exports = router