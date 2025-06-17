const express = require('express')
const router = express.Router()
const {authToken} = require('../middlewares/authMiddleware')
const receitaController = require('../Controllers/receitaController')

router.post('/criar', authToken, receitaController.criarReceita)
router.get('/:idPaciente', authToken, receitaController.listarReceita )


module.exports = router