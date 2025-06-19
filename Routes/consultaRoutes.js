const express = require('express')
const router = express.Router()
const consultaController = require('../Controllers/consultaController.js')
const {authToken, verificarToken} = require('../middlewares/authMiddleware')

router.post('/criar', authToken, consultaController.criarConsulta)
router.patch('/cancelar/:idConsulta', authToken, consultaController.cancelarConsulta)
router.patch('/agendar', authToken, consultaController.agendarConsulta)
router.delete('/deletar/:id', authToken, consultaController.deletarConsulta)
router.get('/listar', authToken, consultaController.listarConsultas)
router.patch('/finalizar/:idConsulta', authToken, consultaController.finalizarConsulta)


module.exports = router