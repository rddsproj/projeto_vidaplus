const User = require('../Models/User')
const bcrypt = require('bcrypt')
const saltRounds = 10;
const logController = require('../Controllers/logController')
const mongoose = require('mongoose');


module.exports = class userController {

        //CREATE
        //CRIA UM NOVO USUARIO
    static async criarUsuario(req, res) {
        //VERIFICA SE O CORPO ESTÁ VAZIO
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio' });
        }
        //PARAMETROS DO CADASTRO
        const {nome, sobrenome, cpf, dataNascimento, telefone, senha, endereco} = req.body;
        const email = req.body.email?.trim().toLowerCase();
        //VERIFICAÇÃO DOS PARAMETROS
        if (!nome || !sobrenome || !cpf || !dataNascimento || !email || !telefone || !senha || !endereco) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
        }
        //CADASTRO DO USUARIO
        try{
            const verificarUsuario = await User.findOne({email});
            if (verificarUsuario){
                return res.status(409).json({message:'Este email já está em uso'});
            }
            //CRIPTOGRAFA A SENHA UTILIZANDO O BCRYPT
            const senhaCriptografada = await bcrypt.hash(senha, saltRounds);
            //CRIA TODOS OS USUARIO COM A ROLE USER
            const user = new User ({nome, sobrenome, cpf, dataNascimento: new Date (dataNascimento), email, telefone, senha: senhaCriptografada, endereco, role: 'paciente' });
            await user.save();
            await logController.registrarLog(user._id, 201, 'Criacao de Usuario', `Usuario ${user.id} criado com sucesso`);
            return res.status(201).json({ message: 'Usuário criado com sucesso', user:{id: user._id, nome: user.nome, role:user.role} });
        }catch(err){
            return res.status(500).json({ message: 'Erro ao criar usuário', error: err.message });
        }
    }

    //READ
    //LISTA OS DADOS DO USUARIO
    static async detalheUsuario(req, res){
        const idUsuario = req.user.id
        const idPesquisa = req.params.id
        const tokenRole = req.user.role
        //Verifica se o ID é valido
        if (!mongoose.Types.ObjectId.isValid(idPesquisa)) {
                    return res.status(400).json({ message: 'ID do usuário inválido' });
                }

        //VERIFICA SE É ADMIN OU O PRORIO USUARIO
        if(tokenRole ==='admin' || idUsuario === idPesquisa){
            try{
                //BUSCA O USUARIO PELA ID
                const user = await User.findById(idPesquisa)
                //SE NÃO ENCONTRAR O USUARIO, RETORNA UM ERRO
                if (!user){
                    return res.status(404).json({message: 'Usuario não encontrado'})
                }
                //RETORNA OS DADOS DO USUARIO
                return res.status(200).json({nome: user.nome, sobrenome: user.sobrenome, dataNascimento: user.dataNascimento.toLocaleDateString('pt-br'), email: user.email, telefone: user.telefone, endereco: user.endereco, role: user.role}) 
        
                
            }catch(err){
                return res.status(500).json({message:'Erro ao detalhar o usuário:', error:err.message})
            }
            //NEGA O ACESSO SE NÃO FOR ADMIN OU O PROPRIO USUARIO
        }else{
            return res.status(403).json({message:'Acesso negado.'})
        }
    }

    //UPDATE
    //EDITA OS DADOS DE UM USUARIO
    static async editarUsuario(req,res){
        const idUsuario = req.params.id
        const {nome,sobrenome, email, telefone, endereco, role, senha} = req.body || {}
        const tokenRole = req.user.role
        //SE NAO INFORMAR NENHUM DADO NO BODY, RETORNA UM ERRO
        if(!nome && !sobrenome && !email && !telefone && !endereco &&!role &&!senha){
            return res.status(400).json({message:'Nenhum dado enviado para atualização'})
        }
        
        
        //APENAS ADMIN E ATENDENTE PODEM ALTERAR OS DADOS DE USUARIOS
        if (tokenRole !== 'admin' && tokenRole !== 'atendente') {
            //CASO NÃO TENHA PERRMISSAO, RETORNA ERRO
            return res.status(403).json({ message: 'Você não tem permissão para editar usuários.' });
        }
        try{
            //BUSCA O USUARIO PELO ID
            const user = await User.findById(idUsuario)
            //SE NÃO ENCONTRAR O USUARIO, RETORNA UM ERRO
            if(!user){
                return res.status(404).json({message: "Usuario não encontrado"})
            }
            //DEFINE O NOVO VALOR PARA CADA PARAMETRO ENVIADO
            if(nome) {user.nome = nome}
            if(sobrenome) {user.sobrenome = sobrenome}
            if(telefone) {user.telefone = telefone}
            if(endereco) {user.endereco = endereco}
            if(role) {
                //SE HOUVER ROLE, VERIFICA SE ESTÁ CORRETO
                if (['admin', 'paciente', 'medico', 'atendente', 'enfermeiro'].includes(role.toLowerCase())) {
                    user.role = role.toLowerCase();
                } else {
                    return res.status(400).json({message:'Role não reconhecida, use: admin, paciente, medico, atendente, enfermeiro'})
                }
            }
                //SE FOR PREENCHIDO A SENHA, FAZ A TROCA
                if (senha) {
                    const salt = await bcrypt.genSalt(saltRounds)
                    const hash = await bcrypt.hash(senha, salt)
                    user.senha = hash
                }
                //EM CASO DE ALTERAÇÃO DE EMAIL, VERIFICA SE NÃO ESTÁ EM USO
                if(email) {
                    const verificarUsuario = await User.findOne({email})
                    if (verificarUsuario){
                        return res.status(400).json({message:'Este email já está em uso'})
                }else{user.email = email}}
                //SALVA OS DADOS DO USUARIO
                await user.save()
                await logController.registrarLog(req.user.id, 202, 'Ediçao de Usuario', `Usuario ${idUsuario} editado com sucesso`)
                //return res.status(200).json({message:'Usuario atualizado com sucesso'})
                return res.status(200).json({ message: 'Usuário atualizado com sucesso', user:{id: user._id, nome: user.nome, sobrenome: user.sobrenome, telefone: user.telefone, endereco: user.endereco, role:user.role} })

        }catch(err){
            return res.status(500).json({message:'Erro ao editar o usuário: ', error:err.message})
        }
    }

    //DELETE
    //DELETA UM USUARIO A PARTIR DO SEU ID
    static async deletarUsuario(req,res){
        const idUsuario = req.params.id
        const tokenRole = req.user.role
        if (!mongoose.Types.ObjectId.isValid(idUsuario)) {
                    return res.status(400).json({ message: 'ID do usuário inválido' });
                }
        try{
            //APENAS ADMIN E ATENDENTE PODEM EXCLUIR USUARIOS
            if (tokenRole ==='admin' || tokenRole === 'atendente'){
                //BUSCA E FAZ A EXCLUSAO DO USUARIO
                const user = await User.findByIdAndDelete(idUsuario)
                //CASO NÃO ENCONTRE O USUARIO, RETORNA UM ERRO
                if(!user){
                    return res.status(404).json({message: "Usuario não encontrado"})
                }
                await logController.registrarLog(req.user.id, 203, 'Exclusão de Usuario', `Usuario ${idUsuario} excluido com sucesso`)
                return res.status(200).json({message:'Usuario deletado com sucesso'})
            }   
                //RETORNA UM ERRO CASO O USUARIO NÃO POSSUA PERMISSÃO
                return res.status(403).json({message:'Você não tem permissao para deletar usuários.'})


        }catch(err){
            return res.status(500).json({message:'Erro ao deletar o usuário. ', error:err.message})
        }
    }
}



