const Log = require('../Models/Log')
const mongoose = require('mongoose');
module.exports = class logController {

/*
    Lista de Codigos dos logs
    101 - login
    201 - Criação de Usuário
    202 - Alteração de Usuário
    203 - Exclusao de Usuário
    301 - Criação de Consulta
    302 - Alteração de Consulta
    303 - Agendamento de Consulta
    304 - Cancelamento de Consulta
    305 - Exclusão de Consulta
    306 - conclusão de Consulta
    401 - Criação de Prontuario
    402 - Visualização de Prontuario
    501 - Criação de Internação
    502 - Alteração de Internação
    601 - Criação de Leito
    602 - Exclusão de Leito
    701 - Consultar Log
    702 - Consultar Log de Usuario
    703 - Consultar Log por Ação
*/


static async registrarLog(usuario, cod, acao, descricao) { 

    try{   
        const log = new Log ({usuario:usuario, cod:cod, acao:acao, descricao:descricao })
        await log.save()
        return
    }       
    catch(err){
        console.log(`Houve um erro: ${err.message}`)
        return
    }
}

static async listarTodos(req, res) {
    const userId = req.user.id;
    const tokenRole = req.user.role;
    let logs;
 
    try {
        //APENAS ADMIN PODE VER OS LOGS
        if (tokenRole === 'admin') {
        //BUSCA TODOS OS LOGS NO BANCO DE DADOS E FILTRA OS CAMPOS
            logs = await Log.find({}, {_id:1, usuario:1, cod:1 ,acao:1, descricao:1, data:1})
                                                        .populate('usuario', 'nome')
                                                        .lean();
            logController.registrarLog(userId, 701, "Consultar Log", `O Usuario:${userId} consultou todos os logs`);
            const qtd = logs.length;
        if (logs.length === 0) {
            return res.status(404).json({ message: 'Nenhum log encontrado.' });
        }
        //FORMATA A DATA
        const logsFormatados = logs.map(log => ({
            ...log,
            data: new Date(log.data).toLocaleString('pt-BR'),
            }));
        return res.status(200).json({message: `Foram encontrados ${qtd} logs`, logs: logsFormatados});
         
        }
        else {            
            return res.status(403).json({ message: 'Você não possui permissao.' });
        }
    }catch (error) {
            return res.status(500).json({ message: 'Erro ao listar os logs.', error: error.message });
        }
}
//RETORNA OS LOGS DE UM USUARIO ESPECIFICO
static async listarPorUsuario(req, res) {
    const userId = req.user.id;
    const tokenRole = req.user.role;
    const filtro = req.params.idUsuario
    let logs;
    if (!mongoose.Types.ObjectId.isValid(filtro)) {
                return res.status(400).json({ message: 'ID de usuario inválido' });
            }
    try {
     
        if (tokenRole === 'admin') {
        logs = await Log.find({usuario: filtro}, {_id:1, usuario:1, cod:1, acao:1, descricao:1, data:1})//filtra os campos que serao retornados
                                                                    .populate('usuario', 'nome')
                                                                    .lean();
        logController.registrarLog(userId, 702, "Consultar Log de Usuario", `O Usuario: ${userId} consultou o log do usuario: ${filtro}`)//salva no log
        const qtd = logs.length;
        if (logs.length === 0) {
            return res.status(404).json({ message: 'Nenhum log encontrado.' });
        }
        //FORMATA A DATA
        const logsFormatados = logs.map(log => ({
            ...log,
            data: new Date(log.data).toLocaleString('pt-BR'),
            }));
        return res.status(200).json({message: `Foram encontrados ${qtd} logs`, logs: logsFormatados});

        }else {            
            return res.status(403).json({ message: 'Você não possui permissao.' });
        }
    }catch (error) {
            return res.status(500).json({ message: 'Erro ao listar os logs.', error: error.message });
        }
}
//LISTA OS LOGS POR CODIGO/AÇÃO
static async listarPorAcao(req, res) {
    const userId = req.user.id;
    const role = req.user.role;
    const filtro = req.params.codigo;
    let logs;
    const codigos = [101, 201, 202, 203, 301, 302, 303, 304, 305, 306, 401, 402, 501, 502, 601, 602, 701, 702, 703]
    if (isNaN(filtro) || !codigos.includes(parseInt(filtro))) {
                return res.status(400).json({ message: 'Código inválido' });
            }
    try {
        //APENAS ADMIN PODE VER OS LOGS
        if (role === 'admin') {
        logs = await Log.find({cod:filtro}, {_id:1, usuario:1, cod:1, acao:1, descricao:1, data:1})
                                                                        .populate('usuario', 'nome')
                                                                        .lean();
        const qtd = logs.length;
        logController.registrarLog(userId, 703, "Consultar Log por Ação", `O Usuario: ${userId} consultou o log da acão: ${filtro}`)
        
        if (logs.length === 0) {
            return res.status(404).json({ message: 'Nenhum log encontrado.' });
        }
        //FORMATA A DATA
        const logsFormatados = logs.map(log => ({
            ...log,
            data: new Date(log.data).toLocaleString('pt-BR'),
            }));
        return res.status(200).json({message: `Foram encontrados ${qtd} logs`, logs: logsFormatados});
        }else {            
            return res.status(404).json({ message: 'Você não possui permissao.' });
        }
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao listar os logs.', error: error.message });
        }
}


}
