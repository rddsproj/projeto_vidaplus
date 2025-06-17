const express = require('express')
const router = express.Router()
const userController = require('../Controllers/userController')
const {authToken, verificarToken} = require('../middlewares/authMiddleware')


router.post('/criar', authToken, userController.criarUsuario)
router.patch('/editar/:id', authToken, userController.editarUsuario)
router.delete('/deletar/:id', authToken, userController.deletarUsuario)
router.get('/listar/:id', authToken, userController.listaUsuario)


module.exports = router