const express = require('express')
const router = express.Router()
const prontuaroController = require('../Controllers/prontuarioController')
const {authToken} = require('../middlewares/authMiddleware')

router.post('/criar', authToken, prontuaroController.criarProntuario)
router.get('/:idPaciente', authToken, prontuaroController.listarProntuario)


module.exports = router