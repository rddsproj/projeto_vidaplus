const Prontuario = require('../Models/Prontuario')
const logController = require('./logController')
const mongoose = require('mongoose');


module.exports = class prontuaroController {
//CREATE
static async criarProntuario(req, res) { // função para criar 
    if (!req.body || Object.keys(req.body).length === 0) {//trata para a aplicação não crashar caso o corpo esteja vazio
        return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio' });
    }
    const {paciente, medico, desc} = req.body
    const userID = req.user.id//recebe o user apos validação do token
    const tokenRole = req.user.role
    

    if(tokenRole === 'doctor' || tokenRole === 'admin'){ // apenas se o usuario for doctor
    if(!paciente){
        return res.status(500).json({ message: 'Insira um paciente '})
    }
    if(!medico){
        return res.status(500).json({ message: 'Insira um medico '})
    }
    if(!desc){
        return res.status(500).json({ message: 'Insira a descricao'})
    }

    try{     
        const prontuario = new Prontuario ({paciente:paciente, medico:medico, descricao: desc})

        await prontuario.save()
        logController.registrarLog(userID, 401, 'Criação de Prontuario', `Criado prontuario id: ${prontuario._id}, vinculada ao paciente ${prontuario.paciente}`)
        return res.status(201).json({ message: 'Prontuario criado com sucesso'})
    }
        

    catch(err){
        return res.status(500).json({ message: 'Erro ao criar o prontuario ', error: err.message})
    }
    }
    return res.status(500).json({ message: 'Você não tem permissao para criar um prontuario'})
}
//READ
static async listarProntuario(req, res){//lista os dados do usuario
        const idPaciente = req.params.idPaciente
        const tokenRole = req.user.role

        if (!mongoose.Types.ObjectId.isValid(idPaciente)) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }
        if(tokenRole ==='admin' || tokenRole === 'doctor'){ 
            try{
                const prontuarios = await Prontuario.find({paciente:idPaciente})
                                                            .populate('medico', 'nome')
                                                            .populate('paciente', 'nome dataNascimento')
                
        
                if (prontuarios.length === 0){ //se não encontrar o usuario, retorna um erro
                    return res.status(404).json({message: 'Nenhum prontuario encontrado'})
                }
                return res.status(200).json(prontuarios
                )

            }catch(err){
                return res.status(500).json({message:'Houve um erro:', error:err.message})
            }
        }else{
            return res.status(403).json({message:'Acesso negado'})
        }
    }


}
