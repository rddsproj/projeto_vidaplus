const Consulta = require('../Models/Consulta')
const logController = require('../Controllers/logController')
const mongoose = require('mongoose');


module.exports = class consultaController {
//CREATE
//FUNÇÃO PARA CRIAR UMA NOVA CONSULTA
static async criarConsulta(req, res) {
    const {data, horario, medico, especialidade, link} = req.body
    //RECEBE O ID DO USER APÓS VALIDAÇÃO
    const userID = req.user.id
    const tokenRole = req.user.role

    if (!mongoose.Types.ObjectId.isValid(medico)) {
                return res.status(400).json({ message: 'ID do medico inválido' });
            }
    //APENAS ADMIN E MÉDICO PODEM CRIAR CONSULTAS
    if(tokenRole === 'admin' || tokenRole === 'medico'){
    //VERIFICA SE NÃO TEM NENHUM CAMPO VAZIO
    if(!data){
        return res.status(400).json({ message: 'É preciso de uma data '})
    }
    if(!horario){
        return res.status(400).json({ message: 'É preciso de um horario '})
    }
    if(!medico){
        return res.status(400).json({ message: 'É preciso de um medico '})
    }
    if(!link){
        return res.status(400).json({ message: 'É preciso de um link para teleconsulta '})
    }
    //TRATAMENTO DA DATA E HORA
    const[dia, mes, ano] = data.split('/')
    const[horas, minutos] = horario.split(':')
    const dataISO = new Date(`${ano}-${mes}-${dia}T${horas}:${minutos}:00`)
    //CRIA A CONSULTA
    try{     
        const consulta = new Consulta ({dataHora:dataISO, medico:medico, especialidade: especialidade, link: link})
        await consulta.save()
        //REGISTRA NO LOG
        logController.registrarLog(userID, 301, 'Criação de de Consulta', `Criado a consulta id: ${consulta._id}, vinculada ao médico ${consulta.medico}, da especialidade: ${consulta.especialidade}, para a data ${consulta.dataHora}`)
        return res.status(201).json({ message: 'Consulta criada com sucesso', id:consulta._id, medico: consulta.medico, data: consulta.dataHora.toLocaleString('pt-br')})
    }
        

    catch(err){
        console.log(`Houve um erro: ${err}`)
        return res.status(500).json({ message: 'Erro ao criar a consulta, ', error:err.message })
    }
    }
    return res.status(403).json({ message: 'Erro ao criar a consulta, você não tem permissao '})
}

//READ
//FUNÇÃO QUE LISTA AS CONSULTAS POR STATUS
static async listarConsultas(req, res) {
    const userId = req.user.id;
    const tokenRole = req.user.role;
    let filtro = req.query.filtro;
    //SE NAO FOR PASSADO FILTRO, RETORNA ERRO
     if (!filtro || filtro.trim() === '') {
        filtro = 'todas'
    } else {
        filtro = filtro.trim().toLowerCase();
    }

    try {
        let consultas = [];
        //FILTRO TODAS RETORNA TODAS AS CONSULTAS DO BANCO DE DADOS
        if (filtro === 'todas'){
            //ADMIN, MÉDICO E ATENDENTE PODEM VER CONSULTAS DE TODOS OS USUARIOS
            if (tokenRole === 'admin' || tokenRole === 'medico' || tokenRole === 'atendente') {
                consultas = await Consulta.find({}).select('_id dataHora medico especialidade status link paciente');
                return res.status(200).json(consultas);
                //SE FOR PACIENTE OU OUTRO TIPO DE ROLE, VÊ APENAS AS CONSULTAS VINCULADAS AO SEU ID
            } else {            
                consultas = await Consulta.find({ paciente: userId }).select('_id dataHora medico especialidade status link paciente');
                return res.status(200).json(consultas);
            }
        }
        //SE TIVER ALGUM DESSES FILTROS, RETORNA APENAS AS QUE POSSUEM O STATUS ESCOLHIDO
        if (filtro ==='agendada' || filtro === 'concluido') {
            //ADMIN, MÉDICO E ATENDENTE PODEM VER CONSULTAS DE TODOS OS USUARIOS
            if (tokenRole === 'admin' || tokenRole === 'medico' || tokenRole === 'atendente') {//admin e doctor pode ver todas
                consultas = await Consulta.find({status:filtro}).select('_id dataHora medico especialidade status link paciente');
                return res.status(200).json(consultas);
            } else {
                //SE FOR PACIENTE OU OUTRO TIPO DE ROLE, VÊ APENAS AS CONSULTAS VINCULADAS AO SEU ID
                consultas = await Consulta.find({ paciente: userId, status:filtro }).select('_id dataHora medico especialidade status link paciente');
                return res.status(200).json(consultas);
            }
        }
        //SE O FILTRO FOR "LIVRE", QUALQUER UM PODE VER
        if (filtro === 'livre') {
                consultas = await Consulta.find({status:filtro}).select('_id dataHora medico especialidade status link paciente');
                return res.status(200).json(consultas);
        }
        if (!consultas || consultas.length === 0) {
            return res.status(404).json({ message: 'Nenhuma consulta encontrada.' });
        }       
        else{
            return res.status(404).json({ message: 'Nenhuma consulta encontrada.' });
        }
            
    } catch (error) {
        return res.status(500).json({ message: 'Ocorreu um erro ao listar consultas.', error: error.message });
    }

    

}

//UPDATE
//FAZ O AGENDAMENTO DA CONSULTA
static async agendarConsulta(req, res){
    const idConsulta = req.body.idConsulta
    const idPaciente = req.body.idPaciente
    const userId = req.user.id
    const tokenRole = req.user.role
    //VERIFICA SE O BODY POSSUI VALORES
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({ message: 'Requisição sem corpo ou corpo vazio' });
    }

    if(!idConsulta){
        return res.json({message: 'É necessario um id da consulta'})
    }

    if(!idPaciente){
        return res.json({message: 'É necessario um id do paciente'})
    }
    console.log(userId)
    //VERIFICAÇÕES, PACIENTE PODE AGENDAR PARA ELE MESMO, ADMIN E ATENDENTE PODE AGENDAR PARA OUTROS USUARIOS
    if(String(idPaciente) === String(userId) || tokenRole === 'admin' || tokenRole ==='atendente'){
        try{
            //ENCONTRA A CONSULTA PELO ID
            const consulta = await Consulta.findById(idConsulta)
    if (!consulta) {
      return res.status(404).json({ message: 'Consulta não encontrada.' });
    }
    //SE A CONSULTA NAO ESTIVER LIVRE, RETORNA UM ERRO
    if(consulta.status != 'livre'){
        return res.status(409).json({message: 'Essa consulta não está disponivel'})
    }
    //EFETUA O AGENDAMENTO DA CONSULTA
        consulta.status = 'agendada'//muda o status para agendado
        consulta.paciente = idPaciente//vincula o id do paciente na consulta
        await consulta.save();
        //REGISTRA NO LOG
        logController.registrarLog(idPaciente, 303, "Agendamento de Consulta", `A consulta id:${idConsulta} foi agendada para o usuario com sucesso!`)//salva no log
        return res.status(200).json({message:"Consulta Agendada com sucesso!", paciente: consulta.paciente, medico: consulta.medico, data: consulta.dataHora.toLocaleString('pt-br'),})
    }
    //TRATAMENTO DE ERROS
    catch (err) {
        return res.status(500).json({ message: 'Erro ao agendar consulta.', error: err.message })
            }
        }
        return res.status(403).json({ message: 'Você não tem permissão para agendar essa consulta.' })
}
//UPDATE
//FAZ O CANCELAMENTO DE UMA CONSULTA, TORNANDO O SEU STATUS LIVRE
static async cancelarConsulta(req, res){
    const idConsulta = req.params.idConsulta
    const userId = req.user.id
    const tokenRole = req.user.role
    //VERIFICA SE O BODY POSSUI VALORES
    if (!mongoose.Types.ObjectId.isValid(idConsulta)) {
                return res.status(400).json({ message: 'ID da Consulta inválido' });
            }
    if(!idConsulta){
        return res.status(400).json({message: 'É necessario um id da consulta'})
    }
    if(!userId){
        return res.status(400).json({message: 'É necessario um id do paciente'})
    }
    try {
        //ENCONTRA A CONSULTA PELO ID
        const consulta = await Consulta.findById(idConsulta)
        //SE ESTIVER LIVRE, APONTA QUE JÁ ESTÁ LIVRE
    if(consulta.status == 'livre'){
        return res.status(409).json({message: 'Essa consulta já está disponivel'})
    }
    //SE O PACIENTE FOR O MESMO QUE O DA CONSULTA, FOR ADMIN OU ATENDENTE, PODE CANCELAR
    if(consulta.paciente?.equals(userId) || tokenRole === 'admin' || tokenRole ==='medico' || tokenRole ==='atendente'){
        consulta.status = 'livre'
        consulta.paciente = null
        await consulta.save();
        //REGISTRA NO LOG
        logController.registrarLog(userId, 304, "Cancelamento de Consulta", `A consulta id:${idConsulta} foi cancelada com sucesso!`)
        return res.status(200).json({message:"Consulta cancelada com sucesso!"})
    }else{
        return res.status(403).json({message:"Você não possui permissao para cancelar a consulta de outro paciente!"})
    }
}catch(err){
    return res.status(500).json({message:'Ocorreu um erro ao cancelar a consulta: ', error:err.message})
}
        
}
static async finalizarConsulta(req, res){
    const idConsulta = req.params.idConsulta
    const userId = req.user.id
    const tokenRole = req.user.role
    //VERIFICA SE O PARAMETRO É UM OBJECTID
    if (!mongoose.Types.ObjectId.isValid(idConsulta)) {
                return res.status(400).json({ message: 'ID da Consulta inválido' });
            }
    if(!idConsulta){
        return res.status(400).json({message: 'É necessario um id da consulta'})
    }
    if(!userId){
        return res.status(400).json({message: 'É necessario um id do paciente'})
    }
    try {
        //ENCONTRA A CONSULTA PELO ID
        const consulta = await Consulta.findById(idConsulta)
        //SE ESTIVER LIVRE, APONTA QUE JÁ ESTÁ LIVRE
    if(consulta.status == 'concluida'){
        return res.status(409).json({message: 'Essa consulta já foi finalizada'})
    }
    //SE O PACIENTE FOR O MESMO QUE O DA CONSULTA, FOR ADMIN OU ATENDENTE, PODE CANCELAR
    if(tokenRole === 'admin' || tokenRole ==='medico'){
        consulta.status = 'concluida'
        consulta.paciente = null
        await consulta.save();
        //REGISTRA NO LOG
        logController.registrarLog(userId, 306, "Finalização de Consulta", `A consulta id:${idConsulta} foi finalizada com sucesso pelo usuario: ${userId}!`)
        return res.status(200).json({message:"Consulta finalizada com sucesso!"})
    }else{
        return res.status(403).json({message:"Você não possui permissao para finalizar consultas!"})
    }
}catch(err){
    return res.status(500).json({message:'Ocorreu um erro ao finalizar a consulta: ', error:err.message})
}
        
}
//DELETE
//DELETA UMA CONSULTA EXISTENTE
static async deletarConsulta(req,res){
        const idConsulta = req.params.id
        const role = req.user.role

        try{
            //APENAS ADMIN E MEDICO PODEM DELETAR UMA CONSULTA
            if (role ==='admin' || role ==='medico'){
                const consulta = await Consulta.findByIdAndDelete(idConsulta)
                if(!consulta){
                    return res.status(404).json({message: "Consulta não encontrada"})
                }
                //REGISTRA NO LOG
                await logController.registrarLog(req.user.id, 305, 'Exclusão de Consulta', `Consulta ${idConsulta} excluida com sucesso`)
                return res.status(200).json({message:'Consulta deletada com sucesso'})
            }
                return res.status(403).json({message:'Você não tem permissao para deletar consultas'})


        }catch(err){
            return res.status(500).json({message:'Ocorreu um erro ao deletar a consulta: ', error:err.message})
        }
    }
}
