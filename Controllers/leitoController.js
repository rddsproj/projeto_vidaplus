const Leito = require('../Models/Leito')
const logController = require('./logController')
const mongoose = require('mongoose');


module.exports = class consultaController {
//CREATE
static async criarLeito(req, res) { // função para criar 
    const userID = req.user.id//recebe o user apos validação do token
    const role = req.user.role

    if(role === 'admin' || role === 'doctor'){ // apenas se o usuario for admin ou doctor
    try{     
        const ultimoLeito = await Leito.findOne().sort({ numero: -1 }) // busca o ultimo leito criado
        let novoNumero = 101; // valor inicial dos numeros do leito

        if (ultimoLeito) {//deefine o numero do novo leito
            novoNumero = parseInt(ultimoLeito.numero) + 1;
        }
        

        const novoLeito = new Leito({
            numero: String(novoNumero),
            status: 'livre'
        });
        await novoLeito.save()
        logController.registrarLog(userID, 601, 'Criação de Leito', `Criado leito id: ${novoLeito._id}, numero: ${novoLeito.numero}`)//cria o log
        return res.status(201).json({ message: 'Leito criado com sucesso'})
    }
        

    catch(err){
        console.log(`Houve um erro: ${err}`)
        return res.status(500).json({ message: 'Erro ao criar a consulta, ', error: err.message})
    }
    }
    return res.status(500).json({ message: 'Erro ao criar a consulta, você não tem permissao '})
}
//READ
static async listarLeitos(req, res){//lista os dados do usuario
        const tokenRole = req.user.role
        if(tokenRole ==='admin' || tokenRole === 'doctor'){ 
            try{
                const leitos = await Leito.find({}, '_id numero  status')
                                    .populate('paciente', 'nome')//popula com o nome do paciente
                
        
                if (leitos.length === 0){ //se não encontrar nenhum leito retorna um erro
                    return res.status(404).json({message: 'Nenhum leito encontrado'})
                }
                return res.status(200).json(leitos)

            }catch(err){
                return res.status(500).json({message:'Houve um erro:', error:err.message})
            }
        }else{
            return res.status(403).json({message:'Acesso negado'})
        }
    }
//DELETE
static async deletarLeito(req,res){
        const idLeito = req.params.idLeito
        const tokenRole = req.user.role

        if (!mongoose.Types.ObjectId.isValid(idLeito)) {
                return res.status(400).json({ message: 'ID do Leito inválido' });//verifica de o ID é valido
            }

        try{
                    
            if (tokenRole ==='admin' || tokenRole ==='doctor'){//só deleta se for admin ou doctor
                const leito = await Leito.findByIdAndDelete(idLeito)
                if(!leito){
                    return res.status(404).json({message: "Leito Não encontrado"})
                }
                await logController.registrarLog(req.user.id, 305, 'Exclusão de Leito', `Leito ${idLeito} excluido com sucesso`)
                return res.status(200).json({message:'Leito excluido com sucesso'})
            }
                return res.status(403).json({message:'Você não tem permissao para deletar leitos'})


        }catch(err){
            return res.status(500).json({message:'Ocorreu um erro: ', error: err.message})
        }
    }

}