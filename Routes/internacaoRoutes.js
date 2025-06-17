const express = require('express')
const router = express.Router()
const {authToken} = require('../middlewares/authMiddleware')
const internacaoController = require('../Controllers/internacaoController')


router.post('/cadastrar', authToken, internacaoController.cadastrarInternacao)
router.patch('/alta/:idInternacao', authToken, internacaoController.altaInternacao )
router.get('/listar/:idPaciente', authToken, internacaoController.listarInternacao )


module.exports = router