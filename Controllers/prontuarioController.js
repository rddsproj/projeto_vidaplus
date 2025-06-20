const Prontuario = require('../Models/Prontuario');
const logController = require('./logController');
const mongoose = require('mongoose');


module.exports = class prontuaroController {
//CREATE
//CRIA O PRONTUARIO
static async criarProntuario(req, res) {
    //VERIFICA O CORPO DA REQUISIÇÃO
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio' });
    }
    const {paciente,  anamnese, hipotese, conduta, observacao} = req.body
    const userId = req.user.id
    const medico = userId
    const tokenRole = req.user.role
    
    //APENAS MEDICO PODE CRIAR UM PRONTUARIO
    if(tokenRole === 'medico' ){
    if(!paciente){
        return res.status(400).json({ message: 'Insira um paciente '});
    }
    if(!medico){
        return res.status(400).json({ message: 'Insira um medico '});
    }
    if(!anamnese){
        return res.status(400).json({ message: 'Insira a anamnese'});
    }
    if(!hipotese){
        return res.status(400).json({ message: 'Insira a hipotese diagnostica'});
    }
    if(!conduta){
        return res.status(400).json({ message: 'Insira a conduta'});
    }
    if(!observacao){
        return res.status(400).json({ message: 'Insira a observação'});
    }

    try{     
        const prontuario = new Prontuario ({paciente:paciente, medico:medico, anamnese: anamnese, hipotese: hipotese, conduta: conduta, observacao: observacao});

        await prontuario.save()
        
        //CRIA UM LOG
        logController.registrarLog(userId, 401, 'Criação de Prontuario', `Criado prontuario id: ${prontuario._id}, vinculada ao paciente ${prontuario.paciente}`);
        return res.status(201).json({ message: 'Prontuario criado com sucesso', id: prontuario._id, paciente: prontuario.paciente, medico: prontuario.medico, anamnese: prontuario.anamnese, hipotese: prontuario.hipotese, conduta: prontuario.conduta, observacao: prontuario.observacao, data: prontuario.data.toLocaleString('pt-br')});
    }
        

    catch(err){
        return res.status(500).json({ message: 'Erro ao criar o prontuario ', error: err.message});
    }
    }
    return res.status(403).json({ message: 'Você não tem permissao para criar um prontuario'});
}
//READ
//LISTA OS PRONTUARIO DE UM PACIENTE
static async listarProntuario(req, res){
        const idPaciente = req.params.idPaciente
        const userId = req.user.id
        const tokenRole = req.user.role
        //VERIFICA SE O ID É UM OBJECTID
        if (!mongoose.Types.ObjectId.isValid(idPaciente)) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }
        if(tokenRole === 'medico' || tokenRole === 'admin'){ 
            try{
                //BUSCA OS PRONTUARIOS PELO PACIENTE
                const prontuarios = await Prontuario.find({paciente:idPaciente})
                                                            .select('anamnese hipotese conduta observacao data')
                                                            .populate('medico', 'nome')
                                                            .populate('paciente', 'nome dataNascimento')
                                                            .lean();
                
                if (prontuarios.length === 0){
                    return res.status(404).json({message: 'Nenhum prontuario encontrado'});
                }
                function formatarProntuario(p){
                    //FORMATA A DATA DO PRONTUARIO
                    const dataFormata = new Date(p.data).toLocaleString('pt-br');
                    //FORMATA A DATA DO PACIENTE
                    const paciente = {
                        ...p.paciente,
                        dataNascimento: new Date(p.paciente.dataNascimento).toLocaleDateString('pt-br')
                    };
                    return{
                        ...p,
                        data: dataFormata,
                        paciente: paciente
                    };
                }
                const prontuariosFormatados = prontuarios.map(formatarProntuario);
                //GERA UM LOG INFORMANDO QUEM ACESSOU O PRONTUARIO
                logController.registrarLog(userId, 402, 'Visualização de Prontuario', `O usuario id: ${userId} acessou e visualizou os prontuarios do paciente id: ${idPaciente}`);
                return res.status(200).json(prontuariosFormatados);

            }catch(err){
                return res.status(500).json({message:'Ocorreu um erro ao consultar os prontuarios:', error:err.message});
            }
        }else{
            return res.status(403).json({message:'Acesso negado'});
        }
    }


}
