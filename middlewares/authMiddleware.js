const jwt = require('jsonwebtoken')

const authToken = (req, res, next) => { //verifica se o token é valido e decodifica ele
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' })
    }

    try {
        const secret = process.env.JWT_SECRET
        const decoded = jwt.verify(token, secret)
        req.user = decoded

            next()
    } catch (error) {
        res.status(400).json({ message: 'Token inválido' })
        //console.log(token)
        return
    }
}

const verificarToken = (req, res, next) =>{//verifica se o token pertence ao usuario utilizando o id
    const tokenId = req.user.id
    const userId = req.params.id
    const userRole = req.user.role
    if (tokenId === userId || userRole === 'admin'){//apenas visualiza o conteudo se for o proprio usuario ou admin
        return next()
    }
    return res.status(403).json({ message: 'Acesso negado. Você não pode acessar dados de outro usuário.' })
}
module.exports = {authToken, verificarToken}
