const Receita = require('../Models/Receita')
const logController = require('./logController')
const mongoose = require('mongoose');


module.exports = class receitaController {
//CREATE
static async criarReceita(req, res) { // função para criar 
    if (!req.body || Object.keys(req.body).length === 0) {//trata para a aplicação não crashar caso o corpo esteja vazio
        return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio' });
    }
    const {paciente, medico, medicamentos} = req.body
    const userID = req.user.id//recebe o user apos validação do token
    const tokenRole = req.user.role
    
    

    if(tokenRole === 'doctor' || tokenRole === 'admin'){ // apenas se o usuario for doctor
    if(!paciente){
        return res.status(500).json({ message: 'Insira um paciente '})
    }
    if(!medico){
        return res.status(500).json({ message: 'Insira um medico '})
    }
    if(!Array.isArray(medicamentos) || medicamentos.length === 0){
        return res.status(500).json({ message: 'Insira os medicamentos'})
    }

    try{     
        const receita = new Receita ({paciente:paciente, medico:medico, medicamentos:medicamentos})
        await receita.save()
        logController.registrarLog(userID, 401, 'Criação de Receita', `Criada receita id: ${receita._id}, vinculada ao paciente ${receita.paciente}`)
        return res.status(201).json({ message: 'Receita Criada com sucesso', receita})
    }
        

    catch(err){
        console.log(`Houve um erro: ${err}`)
        res.status(500).json({ message: 'Erro ao criar a receita, error: ', err })
    }
    }
    res.status(500).json({ message: 'Você não tem permissao para criar uma receita'})
}
//READ
static async listarReceita(req, res){//lista os dados do usuario
        const idPaciente = req.params.idPaciente
        const tokenRole = req.user.role

        if (!mongoose.Types.ObjectId.isValid(idPaciente)) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }
        if(tokenRole ==='admin' || tokenRole === 'doctor'){ 
            try{
                const receitas = await Receita.find({paciente:idPaciente})
                                                            .populate('medico', 'nome')
                                                            .populate('paciente', 'nome dataNascimento')
                
        
                if (receitas.length === 0){ //se não encontrar o usuario, retorna um erro
                    return res.status(404).json({message: 'Nenhuma receita encontrada'})
                }
                return res.status(200).json(receitas)

            }catch(err){
                return res.status(500).json({message:'Houve um erro:', error:err.message})
            }
        }else{
            return res.status(403).json({message:'Acesso negado'})
        }
    }


}
