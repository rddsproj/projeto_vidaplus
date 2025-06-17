const User = require('../Models/User')
const bcrypt = require('bcrypt')
const saltRounds = 10
const logController = require('../Controllers/logController')

    async function criarAdmin(){//função para criar um admin caso nao exista (na primeira execução da aplicaçao)
        try{
            const verificaAdmin = await User.findOne({role:'admin'})
            const senhaCriptografada = await bcrypt.hash('123456', saltRounds) //criptografa a senha
            if(!verificaAdmin){
                const admin = new User ({nome:'Administrador',
                                        sobrenome:'Vidaplus',
                                        cpf:'0000000000',
                                        dataNascimento: new Date('2000-01-01'),
                                        email:'admin@vidaplus.com',
                                        telefone:'(00)00000-0000',
                                        senha:senhaCriptografada,
                                        endereco:'-----',
                                        role:'admin'
                 })
            await admin.save()
            console.log('Usuario Admin criado com sucesso')
            logController.registrarLog(admin._id, 201, 'Criacao de Usuario', `Usuario Admin criado com sucesso`)
            }
            else {
                console.log('Admin já existe, não foi criado um novo')
            }

        }
        catch(err){
            console.log('Erro ao criar o Admin padrão, erro: ', err)
        }
    }

module.exports = criarAdmin