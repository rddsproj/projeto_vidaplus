const Receita = require('../Models/Receita')
const logController = require('./logController')
const mongoose = require('mongoose');


module.exports = class receitaController {
//CREATE
//CRIA UMA RECEITA MEDICA
static async criarReceita(req, res) {
    //VERIFICA SE O CORPO DA REQUISIÇÃO NAO ESTÁ VAZIO
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio' });
    }
    const {paciente, medicamentos} = req.body;
    const userId = req.user.id;
    const medico = userId
    const tokenRole = req.user.role;
    

    //APENAS MEDICO PODE CRIAR RECEITAS
    if(tokenRole === 'medico'){
        //VALIDA SE OS CAMPOS FORAM PREENCHIDOS INDIVIDUALMENTE
    if(!paciente){
        return res.status(400).json({ message: 'Insira um paciente '});
    }
    if(!medico){
        return res.status(400).json({ message: 'Insira um medico '})
    }
    if(!Array.isArray(medicamentos) || medicamentos.length === 0){
        return res.status(400).json({ message: 'Insira os medicamentos'})
    }
    //VERIFICA SE TODOS OS CAMPOS DO ARRAY FOI PREENCHIDO
    for (let i = 0; i < medicamentos.length; i++) {
        const med = medicamentos[i];

        if (!med.nome || !med.quantidade || !med.dosagem || !med.frequencia || !med.observacoes) {
            return res.status(400).json({ message: `Medicamento ${i + 1} está incompleto. Verifique todos os campos.` 
            });
        }
    }

    //CRIA A RECEITA
    try{     
        const receita = new Receita ({paciente:paciente, medico:medico, medicamentos:medicamentos})
        await receita.save()
        logController.registrarLog(userId, 401, 'Criação de Receita', `Criada receita id: ${receita._id}, vinculada ao paciente ${receita.paciente}`)
        return res.status(201).json({ message: 'Receita Criada com sucesso', id: receita._id, paciente: receita.paciente, medico: receita.medico, medicamentos: receita.medicamentos, data: receita.data.toLocaleDateString('pt-br')})
    }
        

    catch(err){
        return res.status(500).json({ message: 'Erro ao criar a receita. ', error: err.message })
    }
    }
    return res.status(403).json({ message: 'Você não tem permissao para criar uma receita'})
}
//READ
//LISTA AS RECEITAS DE UM PACIENTE
static async listarReceita(req, res){
        const idPaciente = req.params.idPaciente;
        const userId = req.user.id;
        const tokenRole = req.user.role;
        //VERIFICA SE O ID DO PACIENTE É DO TIPO OBJECTID
        if (!mongoose.Types.ObjectId.isValid(idPaciente)) {
            return res.status(400).json({ message: 'ID de paciente inválido' });
        }//ADMIN , MEDICO, 
        if(tokenRole ==='admin' || tokenRole === 'medico' || userId === idPaciente || tokenRole === 'enfermeiro'){ 
            try{
                const receitas = await Receita.find({paciente:idPaciente})
                                                            .populate('medico', 'nome sobrenome')
                                                            .populate('paciente', 'nome sobrenome')
                                                            .select('-__v -createdAt -updatedAt')
                                                            .lean()
                
                //VERIFICA SE EXISTE ALGUMA RECEITA DO PACIENTE
                if (receitas.length === 0){
                    return res.status(404).json({message: 'Nenhuma receita encontrada'})
                }
                //FORMATA A DATA DA RECEITA
                const receitaFormatada = receitas.map(receita => ({
                    ...receita,
                    data: new Date(receita.data).toLocaleDateString('pt-BR')
                }));
                return res.status(200).json(receitaFormatada)

            }catch(err){
                return res.status(500).json({message:'Ocorreu um erro ao consultar as receitas.', error:err.message})
            }
        }else{
            return res.status(403).json({message:'Acesso negado'})
        }
    }


}
