const User = require('../Models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const logController = require('../Controllers/logController')
require('dotenv').config()


module.exports = class loginController{
    
    static async login (req, res){//sistema de login
        if (!req.body || Object.keys(req.body).length === 0) {//trata para a aplicação não crashar caso o corpo esteja vazio
        return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio' });
    }

        const email = req.body.email
        const senha = req.body.senha
        try{
        const user = await User.findOne({email:email})//busca o usuario pelo email

        if (!user){ //se não encontrar o usuario, retorna um erro
            return res.status(404).json({message: 'Usuario não encontrado'})
        }
        const compararSenha = await (bcrypt.compare(senha, user.senha))//compara a senha com o banco de dados, se estiver incorreta, retorna um erro
        console.log(compararSenha)
        if (!compararSenha){
            //return res.status(404).json({message: 'Senha incorreta'})
            return res.render('login/login', {error: "Senha Incorreta"})
        }
        
        const token = jwt.sign({//gera o token, com duração de 1 dia
            id: user._id,
            nome: user.nome,
            role:user.role
        },
        process.env.JWT_SECRET,
        {expiresIn:'1d'}
        )
        logController.registrarLog(user._id, '101', 'Login', `Usuario ${user.id} logado com sucesso`)
        res.status(200).json({
            message: 'Login bem-sucedido',
            token,
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email
            }
        
        })
    }catch(err){
        res.status(500).json({message:'Houve um erro no login', error:err.message})
    }}

}