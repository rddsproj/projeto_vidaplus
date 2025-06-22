const Internacao = require('../Models/Internacao');
const logController = require('./logController');
const Leito = require('../Models/Leito');
const mongoose = require('mongoose');
const Prontuario = require('../Models/Prontuario');


module.exports = class internacaoController {
//CREATE
//CRIA UMA INTERNAÇÃO
static async cadastrarInternacao(req, res) {
    //VERIFICA O CORPO DA REQUISIÇÃO
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio' });
    }
    const {paciente, motivo, observacoes, prontuario} = req.body
    const userId = req.user.id
    const medico = userId
    const tokenRole = req.user.role
    
    //VALIDA SE O ID É UM OBJECTID
    if (!mongoose.Types.ObjectId.isValid(paciente)) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }
    if (userId === paciente){
        return res.status(403).json({message: 'Você não pode internar a sí proprio'})
    }
    //APENAS MEDICO PODE INTERNAR UM PACIENTE
    if(tokenRole === 'medico'){
    //VERIFICA OS PARAMETROS PASSADOS
    if(!paciente){
        return res.status(400).json({ message: 'Insira um paciente '})
    }
    if(!medico){
        return res.status(400).json({ message: 'Insira um medico '})
    }
    if(!motivo){
        return res.status(400).json({ message: 'Insira o motivo'})
    }
    if(!observacoes){
        return res.status(400).json({ message: 'Insira as observacoes'})
    }
    //SE FOR INSERIDO UM PRONTUARIO NO CORPO DA REQUISIÇÃO, ELE TAMBÉM CRIA UM PRONTUARIO PARA O PACIENTE
    if(prontuario){
        const {anamnese, hipotese, conduta, observacao} = prontuario;
        //VERIFICA OS PARAMETROS PARA O PRONTUARIO
        if(!prontuario.anamnese || !prontuario.hipotese || !prontuario.conduta || !prontuario.observacao){
            return res.status(400).json({message: 'Informações para o prontuario incompletas'})
        }
        //CRIA UM PRONTUARIO
        const prontuarioInternacao = new Prontuario ({
            paciente, medico, anamnese, hipotese, conduta, observacao
        });
        await prontuarioInternacao.save()
        logController.registrarLog(userId, 401, 'Criação de Prontuario', `Criado prontuario id: ${prontuarioInternacao._id}, vinculada ao paciente ${paciente} durante o processo de internação`);

    }
    //CRIA A INTERNAÇÃO
    try{ 
        //VERIFICA SE POSSUI UM LEITO LIVRE
        const leitoLivre = await Leito.findOne({status: 'livre'})
        if (!leitoLivre){
            return res.status(409).json({ message: 'Nenhum leito disponível no momento.' })
        }
        leitoLivre.status = 'ocupado'
        leitoLivre.paciente = paciente
        leitoLivre.dataEntrada = Date.now()
        leitoLivre.dataSaida = null

        const internacao = new Internacao ({paciente:paciente, medico:medico, motivo:motivo, observacoes:observacoes, leito: leitoLivre._id})
        await internacao.save()
        await leitoLivre.save()
        logController.registrarLog(userId, 501, 'Criação de Internacao', `Criada internacao id: ${internacao._id}, vinculada ao paciente ${internacao.paciente}`)
        return res.status(201).json({ message: 'Internacao Criada com sucesso', internacao: {id: internacao._id, paciente: internacao.paciente, leito: leitoLivre.numero, motivo: internacao.motivo, observacoes: internacao.observacoes, dataEntrada: internacao.dataEntrada.toLocaleString('pt-br')}})
    }
        

    catch(err){
        console.log(`Houve um erro: ${err}`)
        res.status(500).json({ message: 'Erro ao criar a internacao, error: ', error: err.message })
    }
    }
    return res.status(403).json({ message: 'Você não tem permissao para criar uma internacao'})
}
//READ
//LISTA A INTERNAÇÃO DE UM PACIENTE
static async listarInternacao(req, res){
        const idPaciente = req.params.idPaciente;
        const tokenRole = req.user.role;
        //VERIFICA DE O ID É UM OBJECTID
        if (!mongoose.Types.ObjectId.isValid(idPaciente)) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }
        //APENAS ADMIN, MEDICO E ENFERMEIRO PODEM VER A INTERNAÇÃO DE UM PACIENTE
        if(tokenRole ==='admin' || tokenRole === 'medico' || tokenRole === 'enfermeiro'){ 
            try{
                //BUSCA  INTERNACAO PELO ID DO PACIENTE
                const internacoes = await Internacao.find({paciente:idPaciente})
                                                            .select('-createdAt -updatedAt -__v')
                                                            .lean();
                                                       
                
        
                if (internacoes.length === 0){ 
                    return res.status(404).json({message: 'Nenhuma internação encontrada'});
                }
                //FORMATAÇÃO DAS DATAS
                const internacoesFormatada = internacoes.map(internacao => {
                    const internacaoFormatada = {
                    ...internacao,
                    dataEntrada: new Date(internacao.dataEntrada).toLocaleString('pt-br')
                };
                if (internacao.dataSaida) {
                    internacaoFormatada.dataSaida = new Date(internacao.dataSaida).toLocaleString('pt-BR');
                }
                return internacaoFormatada;
                }
                );
                
                return res.status(200).json(internacoesFormatada);

            }catch(err){
                return res.status(500).json({message:'Ocorreu um erro ao consultar as internações.', error:err.message});
            }
        }else{
            return res.status(403).json({message:'Acesso negado'});
        }
    }

//UPDATE
    //DÁ ALTA DE UMA INTERNAÇÃO
    static async altaInternacao(req, res) {
    const idInternacao = req.params.idInternacao;
    const userID = req.user.id;
    const tokenRole = req.user.role;
    
    //APENAS MEDICO PODE DAR ALTA DE UMA INTERNAÇÃO
    if(tokenRole === 'medico'){
    if(!idInternacao){
        return res.status(400).json({ message: 'Insira id da internacao para dar alta '});
    }
    
    try{     
        //BUSCA A INTERNAÇÃO E O LEITO
        const internacao = await Internacao.findById(idInternacao);
        const leito =  await Leito.findById(internacao.leito);

        if (internacao.length === 0){
            return res.status(404).json({message: 'Nenhuma internacao encontrada.'});
        }
        //FAZ AS ALTERAÇÕES NA INTERNAÇÃO E NO LEITO
        if(!internacao.dataSaida){
            internacao.dataSaida = Date.now();
            internacao.status = "alta";
            leito.dataSaida = Date.now();
            leito.status = 'livre';
            leito.paciente = null;

            logController.registrarLog(userID, 502, 'Alteração de Internação', `Alterada a internacao id: ${internacao._id}, vinculada ao paciente ${internacao.paciente}, foi dado alta ao paciente.`);
            await internacao.save();
            await leito.save();
            return res.status(200).json({ message: 'Internacao atualizada com sucesso', internacao: {id: internacao._id, paciente: internacao.paciente, leito: leito.numero, status: internacao.status, dataEntrada: internacao.dataEntrada.toLocaleString('pt-br'), dataSaida: internacao.dataEntrada.toLocaleString('pt-br')}});
        }else{
            return res.status(409).json({ message: 'Internacao já teve alta'});
        }
    }
        

    catch(err){
        console.log(`Houve um erro: ${err}`)
        res.status(500).json({ message: 'Erro ao dar alta na internacao, error: ', error: err.message });
    }
    }
    return res.status(403).json({ message: 'Você não tem permissao para dar alta em uma internação'});
}



}
