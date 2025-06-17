const User = require('../Models/User')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const logController = require('../Controllers/logController')

module.exports = class userController {

        //CREATE
    static async criarUsuario(req, res) { // função para criar o usuario, como padrão, ele cria os usuarios com a role = user
        if (!req.body || Object.keys(req.body).length === 0) {//trata para a aplicação não crashar caso o corpo esteja vazio
            return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio' });
        }
        const tokenRole = req.user.role

        if(tokenRole !== 'admin'){
            return res.status(403).json({message:'Acesso negado, apenas admin pode criar usuarios'})
        }
        const {nome, sobrenome, cpf, dataNascimento, email, telefone, senha, endereco} = req.body
        if (!req.body.role?.trim()) {
        delete req.body.role; // Remove se for "" ou apenas espaços
        }

        let role = req.body.role;
        if (role) {

            if (['admin', 'doctor', 'user'].includes(role.toLowerCase())) {
                role = role.toLowerCase();
            } else {
                return res.status(400).json({message:'Role não reconhecida, use: admin, doctor ou user'})
            }
        }

        if (!nome || !sobrenome || !cpf || !dataNascimento || !email || !telefone || !senha || !endereco) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' })

        }

        try{
            const verificarUsuario = await User.findOne({email})
            if (verificarUsuario){
                return res.status(400).json({message:'Este email já está em uso'})
            }
            const senhaCriptografada = await bcrypt.hash(senha, saltRounds) //criptografa a senha
            const user = new User ({nome, sobrenome, cpf, dataNascimento: new Date (dataNascimento), email, telefone, senha: senhaCriptografada, endereco, role })
            await user.save()
            console.log(`Usuário ${nome} criado com sucesso!`)
            await logController.registrarLog(user._id, 201, 'Criacao de Usuario', `Usuario ${user.id} criado com sucesso`)
            return res.status(201).json({ message: 'Usuário criado com sucesso', user:{id: user._id, nome: user.nome, role:user.role} })
        }catch(err){
            return res.status(500).json({ message: 'Erro ao criar usuário', error: err })
        }
    }

    //READ
    static async listaUsuario(req, res){//lista os dados do usuario
        const idUsuario = req.user.id
        const idPesquisa = req.params.id
        const role = req.user.role

    
        if(role ==='admin' || idUsuario === idPesquisa){ //se for admin ou o proprio usuario
            try{
                const user = await User.findById(idPesquisa)//busca o usuario pelo id
        
                if (!user){ //se não encontrar o usuario, retorna um erro
                    return res.status(404).json({message: 'Usuario não encontrado'})
                }
                console.log(user.nome)
                return res.status(200).json({nome: user.nome, email: user.email, role: user.role}) //retorna os dados do usuario
        
                
            }catch(err){
                return res.status(500).json({message:'Houve um erro:', error:err.message})
            }
        }else{
            return res.status(403).json({message:'Acesso negado'})
        }
    }

    //UPDATE
    static async editarUsuario(req,res){
        const idUsuario = req.params.id
        const {nome,sobrenome, email, telefone, role} = req.body || {}
        const tokenRole = req.user.role

        if(!nome && !sobrenome && !email && !telefone &&!role){
            return res.status(400).json({message:'Nenhum dado enviado para atualização'})
        }

        if (tokenRole !== 'admin') {
        return res.status(403).json({ message: 'Você não tem permissão para editar usuários.' });
    }
        try{
                    
                const user = await User.findById(idUsuario)
                if(!user){
                    return res.status(404).json({message: "Usuario não encontrado"})
                }
                if(nome) {user.nome = nome}
                if(sobrenome) {user.sobrenome = sobrenome}
                if(email) {
                    const verificarUsuario = await User.findOne({email})
                    if (verificarUsuario){
                        return res.status(400).json({message:'Este email já está em uso'})
                }else{user.email = email}}
                if(telefone) {user.telefone = telefone}
                if(role) {user.role = role}

                await user.save()
                await logController.registrarLog(req.user.id, 202, 'Ediçao de Usuario', `Usuario ${idUsuario} editado com sucesso`)
                return res.status(200).json({message:'Usuario atualizado com sucesso'})

        }catch(err){
            return res.status(500).json({message:'Ocorreu um erro: ', err})
        }
    }

    //DELETE
    static async deletarUsuario(req,res){
        const idUsuario = req.params.id
        const role = req.user.role

        try{
                    
            if (role ==='admin'){
                const user = await User.findByIdAndDelete(idUsuario)
                if(!user){
                    return res.status(404).json({message: "Usuario não encontrado"})
                }
                await logController.registrarLog(req.user.id, 203, 'Exclusão de Usuario', `Usuario ${idUsuario} excluido com sucesso`)
                return res.status(200).json({message:'Usuario deletado com sucesso'})
            }
                return res.status(403).json({message:'Você não tem permissao para deletar usuarios'})


        }catch(err){
            return res.status(500).json({message:'Ocorreu um erro: ', err})
        }
    }
}



