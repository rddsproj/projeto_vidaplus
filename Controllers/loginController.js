const User = require('../Models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const logController = require('../Controllers/logController')
require('dotenv').config()


module.exports = class loginController{
    //FUNÇÃO DE LOGIN
    static async login (req, res){
        //VERIFICA SE O CORPO DA REQUISIÇÃO POSSUI PARAMETROS
        if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio.' });
    }
        //DEFINE AS VARIAVEIS
        const email = req.body.email
        const senha = req.body.senha
        try{
        //BUSCA O USUARIO PELO EMAIL
        const user = await User.findOne({email:email});
        //SE NÃO ENCONTRAR USUARIO, RETORNA UM ERRO
        if (!user){ 
            return res.status(404).json({message: 'Usuario não encontrado.'});
        }
        //COMPARA A SENHA DISPONIBILIZADA COM A SENHA DO BANCO DE DADOS, USANDO O BCRYPT
        const compararSenha = await (bcrypt.compare(senha, user.senha));
        //SE A SENHA ESTIVER INCORRETA, RETORNA UM ERRO
        if (!compararSenha){
            return res.status(401).json({message: 'Senha incorreta'});
        }
        //GERA UM TOKEN JWT COM DURAÇÃO DE 1 DIA
        const token = jwt.sign({
            id: user._id,
            nome: user.nome,
            role:user.role
        },
        process.env.JWT_SECRET,
        {expiresIn:'1d'}
        )
        //REGISTRA NO LOG
        logController.registrarLog(user._id, 101, 'Login', `Usuario ${user.id} logado com sucesso`);
        return res.status(200).json({
            message: 'Login bem-sucedido',
            token,
            user: {
                id: user._id,
                nome: user.nome,
                email: user.email,
                role: user.role
            }
        
        })
    }catch(err){
        return res.status(500).json({message:'Houve um erro no login.', error:err.message});
    }}

}