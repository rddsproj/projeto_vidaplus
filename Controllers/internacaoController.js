const Internacao = require('../Models/Internacao')
const logController = require('./logController')
const Leito = require('../Models/Leito')
const mongoose = require('mongoose');


module.exports = class internacaoController {
//CREATE
static async cadastrarInternacao(req, res) { // função para criar 
    if (!req.body || Object.keys(req.body).length === 0) {//trata para a aplicação não crashar caso o corpo esteja vazio
        return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio' });
    }
    const {paciente, medico, motivo, observacoes} = req.body
    const userID = req.user.id//recebe o user apos validação do token
    const tokenRole = req.user.role
    
    
    if (!mongoose.Types.ObjectId.isValid(paciente)) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }
    if (!mongoose.Types.ObjectId.isValid(medico)) {
            return res.status(400).json({ message: 'ID de medico inválido' });
        }

    if(tokenRole === 'doctor' || tokenRole === 'admin'){ // apenas se o usuario for doctor
    if(!paciente){
        return res.status(500).json({ message: 'Insira um paciente '})
    }
    if(!medico){
        return res.status(500).json({ message: 'Insira um medico '})
    }
    if(!motivo){
        return res.status(500).json({ message: 'Insira o motivo'})
    }
    if(!observacoes){
        return res.status(500).json({ message: 'Insira as observacoes'})
    }

    try{     
        const leitoLivre = await Leito.findOne({status: 'livre'})//procura um leito livre

        if (!leitoLivre){
            return res.status(400).json({ message: 'Nenhum leito disponível no momento.' })
        }
        leitoLivre.status = 'ocupado'
        leitoLivre.paciente = paciente
        leitoLivre.dataEntrada = Date.now()
        leitoLivre.dataSaida = null

        const internacao = new Internacao ({paciente:paciente, medico:medico, motivo:motivo, observacoes:observacoes, leito: leitoLivre._id})
        await internacao.save()
        await leitoLivre.save()
        logController.registrarLog(userID, 401, 'Criação de Internacao', `Criada internacao id: ${internacao._id}, vinculada ao paciente ${internacao.paciente}`)
        return res.status(201).json({ message: 'Internacao Criada com sucesso', internacao})
    }
        

    catch(err){
        console.log(`Houve um erro: ${err}`)
        res.status(500).json({ message: 'Erro ao criar a internacao, error: ', err })
    }
    }
    res.status(500).json({ message: 'Você não tem permissao para criar uma internacao'})
}
//READ
static async listarInternacao(req, res){//lista os dados do usuario
        const idPaciente = req.params.idPaciente
        const tokenRole = req.user.role

        if (!mongoose.Types.ObjectId.isValid(idPaciente)) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }
        if(tokenRole ==='admin' || tokenRole === 'doctor'){ 
            try{
                const internacoes = await Internacao.find({paciente:idPaciente})
                                                            .populate('paciente', 'nome dataNascimento')
                                                            .populate('leito', 'numero')
                
        
                if (internacoes.length === 0){ //se não encontrar o usuario, retorna um erro
                    return res.status(404).json({message: 'Nenhuma receita encontrada'})
                }
                return res.status(200).json(internacoes)

            }catch(err){
                return res.status(500).json({message:'Houve um erro:', error:err.message})
            }
        }else{
            return res.status(403).json({message:'Acesso negado'})
        }
    }

//UPDATE
    static async altaInternacao(req, res) { // função para criar 
    const idInternacao = req.params.idInternacao
    const userID = req.user.id//recebe o user apos validação do token
    const tokenRole = req.user.role
    

    if(tokenRole === 'doctor' || tokenRole === 'admin'){ // apenas se o usuario for doctor
    if(!idInternacao){
        return res.status(500).json({ message: 'Insira id da internacao para dar alta '})
    }
    
    try{     
        const internacao = await Internacao.findById(idInternacao)
        const leito =  await Leito.findById(internacao.leito)

        if (internacao.length === 0){
            return res.status(404).json({message: 'Nenhuma internacao encontrada'})
        }
        if(!internacao.dataSaida){
            internacao.dataSaida = Date.now()
            internacao.status = "alta"
            leito.dataSaida = Date.now()
            leito.status = 'livre'
            leito.paciente = null

            logController.registrarLog(userID, 502, 'Alteração de Internação', `Alterada a internacao id: ${internacao._id}, vinculada ao paciente ${internacao.paciente}, foi dado alta ao paciente.`)
            await internacao.save()
            await leito.save()
            return res.status(201).json({ message: 'Internacao atualizada com sucesso', internacao})
        }else{
            return res.status(201).json({ message: 'Internacao já teve alta'})
        }
    }
        

    catch(err){
        console.log(`Houve um erro: ${err}`)
        res.status(500).json({ message: 'Erro ao dar alta na internacao, error: ', err })
    }
    }
    res.status(500).json({ message: 'Você não tem permissao para dar alta em uma'})
}



}
