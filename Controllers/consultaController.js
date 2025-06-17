const Consulta = require('../Models/Consulta')
const logController = require('../Controllers/logController')



module.exports = class consultaController {
//CREATE
static async criarConsulta(req, res) { // função para criar 
    const {data, paciente, medico, especialidade} = req.body
    const userID = req.user.id//recebe o user apos validação do token
    const role = req.user.role
    

    if(role === 'admin' || role === 'doctor'){ // apenas se o usuario for admin ou doctor
    if(!data){
        return res.status(500).json({ message: 'É preciso de uma data '})
    }
    if(!medico){
        return res.status(500).json({ message: 'É preciso de um medico '})
    }
    if(!especialidade){
        return res.status(500).json({ message: 'É preciso de uma especialidade '})
    }

    try{     
        const consulta = new Consulta ({dataHora: new Date(data), paciente:paciente, medico:medico, especialidade: especialidade})

        await consulta.save()
        logController.registrarLog(userID, 301, 'Criação de de Consulta', `Criado a consulta id: ${consulta._id}, vinculada ao médico ${consulta.medico}, da especialidade: ${consulta.especialidade}, para a data ${consulta.dataHora}`)//cria a consulta no banco de dados
        return res.status(201).json({ message: 'Consulta criada com sucesso'})
    }
        

    catch(err){
        console.log(`Houve um erro: ${err}`)
        return res.status(500).json({ message: 'Erro ao criar a consulta, error: err '})
    }
    }
    return res.status(500).json({ message: 'Erro ao criar a consulta, você não tem permissao '})
}

//READ
static async listarPorStatus(req, res) {
    const userId = req.user.id;
    const role = req.user.role;
    const filtro = req.params.filtro; // pode ser 'todas' ou um id

    try {
        let consultas = [];

        if (filtro === 'todas'){
            
            if (role === 'admin' || role === 'doctor') {//admin e doctor pode ver todas
                consultas = await Consulta.find({});
                return res.status(200).json(consultas);
            } else {            
                consultas = await Consulta.find({ paciente: userId });//user ve apenas a dele
            }
        }

        if (filtro === 'livre' || filtro ==='agendado' || filtro === 'concluido') {
            if (role === 'admin' || role === 'doctor') {//admin e doctor pode ver todas
                
                consultas = await Consulta.find({status:filtro});
            } else {
                
                consultas = await Consulta.find({ paciente: userId, status:filtro });//user ve apenas a dele
            }
        }if (!consultas || consultas.length === 0) {
            return res.status(404).json({ message: 'Nenhuma consulta encontrada.' });
        }       
        
        else{
            return res.status(404).json({ message: 'Nenhuma consulta encontrada.' });
        }
            
    } catch (error) {
        console.error('Erro ao listar consultas:', error);
        return res.status(500).json({ message: 'Erro ao listar consultas.', error: error.message });
    }

    

}

//UPDATE
static async agendarConsulta(req, res){//faz o agendamento da consulta
    const idConsulta = req.params.idConsulta
    const idPaciente = req.user.id//recebe o user apos validação do token


    if(!idConsulta){
        return res.json({message: 'É necessario um id da consulta'})
    }

    if(!idPaciente){
        return res.json({message: 'É necessario um id do paciente'})
    }

    const consulta = await Consulta.findById(idConsulta)// encontra a consulta pelo id
    if(consulta.status != 'livre'){//se não estiver livre, aponta que ela não está disponivel
        return res.json({message: 'Essa consulta não está disponivel'})
    }

    consulta.status = 'agendado'//muda o status para agendado
    consulta.paciente = idPaciente//vincula o id do paciente na consulta

    await consulta.save();
    logController.registrarLog(idPaciente, 303, "Agendamento de Consulta", `A consulta id:${idConsulta} foi agendada para o usuario com sucesso!`)//salva no log
    return res.status(201).json({message:"Consulta Agendada com sucesso!"})
    }
//UPDATE
static async cancelarConsulta(req, res){//faz o cancelamento da consulta, tornando-a livre
    const idConsulta = req.params.idConsulta
    const userId = req.user.id//recebe o user apos validação do token
    const role = req.user.role


    if(!idConsulta){
        return res.json({message: 'É necessario um id da consulta'})
    }

    if(!userId){
        return res.json({message: 'É necessario um id do paciente'})
    }


    const consulta = await Consulta.findById(idConsulta)// encontra a consulta pelo id
    if(consulta.status == 'livre'){//se não estiver livre, aponta que ela não está disponivel
        return res.json({message: 'Essa consulta já está livre'})
    }
    if(consulta.paciente?.equals(userId) || role === 'admin'){// se o usuario for o mesmo da consult
        consulta.status = 'livre'//muda o status para agendado
        consulta.paciente = null//vincula o id do paciente na consulta

    await consulta.save();
    logController.registrarLog(userId, 304, "Cancelamento de Consulta", `A consulta id:${idConsulta} foi cancelada com sucesso!`)//salva no log
    res.status(201).json({message:"Consulta cancelada com sucesso!"})
    return
    }else{
        return res.status(201).json({message:"Você não possui permissao para cancelar a consulta de outro paciente!"})
    }
        
}

//DELETE
static async deletarConsulta(req,res){
        const idConsulta = req.params.id
        const role = req.user.role

        try{
                    
            if (role ==='admin' || role ==='doctor'){//só deleta se for admin ou doctor
                const consulta = await Consulta.findByIdAndDelete(idConsulta)
                if(!consulta){
                    return res.status(404).json({message: "Consulta não encontrada"})
                }
                await logController.registrarLog(req.user.id, 305, 'Exclusão de Consulta', `Consulta ${idConsulta} excluida com sucesso`)
                return res.status(200).json({message:'Consulta deletada com sucesso'})
            }
                return res.status(403).json({message:'Você não tem permissao para deletar consultas'})


        }catch(err){
            return res.status(500).json({message:'Ocorreu um erro: ', err})
        }
    }
}
