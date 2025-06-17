const express = require('express')
const router = express.Router()
const loginController = require('../Controllers/loginController.js')



router.post('/', loginController.login)


module.exports = router