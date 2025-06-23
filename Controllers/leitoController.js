const Leito = require('../Models/Leito')
const logController = require('./logController')
const mongoose = require('mongoose');


module.exports = class consultaController {
//CREATE
//CRIA UM OU VARIOS LEITOS
static async criarLeito(req, res) {
    const userID = req.user.id;
    const role = req.user.role;
    //APENAS ADMIN PODE CRIAR LEITOS
    if (role !== 'admin') {
        return res.status(403).json({ message: 'Apenas administradores podem criar leitos.' });
    }

    let qtd;
    //VERIFICA SE QTD FOI PASSADO
    if (req.query.qtd && !isNaN(parseInt(req.query.qtd))) {
        qtd = parseInt(req.query.qtd);
    } else {
        qtd = null;
    }

    try {
        const ultimoLeito = await Leito.findOne().sort({ numero: -1 });
        let novoNumero = ultimoLeito ? parseInt(ultimoLeito.numero) + 1 : 101;
        //SE HOUVER QUANTIDADE E FOR MAIOR QUE 1, CRIA VARIOS LEITOS DE UMA SÓ VEZ
        if (qtd && qtd > 1) {
            const novosLeitos = [];

            for (let i = 0; i < qtd; i++) {
                novosLeitos.push({ numero: String(novoNumero++), status: 'livre' });
            }
            //INSERE VARIOS LEITOS NO BANCO DE DADOS DE UMA VEZ
            const leitosCriados = await Leito.insertMany(novosLeitos);

            for (const leito of leitosCriados) {
                await logController.registrarLog(userID, 601, 'Criação de Leito', `Criado leito id: ${leito._id}, número: ${leito.numero}`);
            }

            return res.status(201).json({ message: `${leitosCriados.length} leito(s) criado(s) com sucesso.` });
        } else {
            //CRIA APENAS UM LEITO
            const leitoUnico = new Leito({ numero: String(novoNumero), status: 'livre' });
            await leitoUnico.save();

            await logController.registrarLog(userID, 601, 'Criação de Leito', `Criado leito id: ${leitoUnico._id}, número: ${leitoUnico.numero}`);

            return res.status(201).json({ message: 'Leito criado com sucesso' });
        }
    }

    catch(err){
        return res.status(500).json({ message: 'Erro ao criar o leito. ', error: err.message});
    }
    
}
//READ
//LISTA TODOS OS LEITOS
static async listarLeitos(req, res){
        const tokenRole = req.user.role;
        //APENAS ADMIN, MEDICO E ENFERMEIRO PODEM LISTAR OS LEITOS
        if(tokenRole ==='admin' || tokenRole === 'medico' || tokenRole ==='enfermeiro'){ 
            try{
                const leitos = await Leito.find({}, '_id numero  status')
                                    .populate('paciente', 'nome')
                                    .lean();
                
                //VERIFICA SE EXISTEM LEITOS
                if (leitos.length === 0){
                    return res.status(404).json({message: 'Nenhum leito encontrado'});
                }
                //RETORNA TODOS OS LEITOS
                return res.status(200).json(leitos);

            }catch(err){
                return res.status(500).json({message:'Houve um erro ao listar os leitos.', error:err.message});
            }
        }else{
            return res.status(403).json({message:'Acesso negado'});
        }
    }
//DELETE
static async deletarLeito(req,res){
        const numero = req.params.numero;
        const tokenRole = req.user.role;

        if (isNaN(numero)) {
                return res.status(400).json({ message: 'Numero do Leito inválido' });
            }

        try{
                //APENAS ADMIN PODE DELETAR UM LEITO
            if (tokenRole ==='admin' ){
                const leito = await Leito.findOneAndDelete({numero: numero});
                if(!leito){
                    return res.status(404).json({message: "Leito Não encontrado"});
                }
                if(leito.status === 'ocupado'){
                    return res.starus(409).json({message:"Leito ocupado, você não pode deletar ele"});
                }
                //REGISTA NO LOG
                await logController.registrarLog(req.user.id, 602, 'Exclusão de Leito', `Leito ${numero} excluido com sucesso`);
                return res.status(200).json({message:`Leito ${numero} excluido com sucesso`});
            }
                return res.status(403).json({message:'Você não tem permissao para deletar leitos'});


        }catch(err){
            return res.status(500).json({message:'Ocorreu um erro ao deletar o leito. ', error: err.message});
        }
    }

}