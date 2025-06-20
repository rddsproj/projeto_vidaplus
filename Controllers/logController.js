const Log = require('../Models/Log')

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
    403 - Exclusão de Prontuario
    501 - Criação de Internação
    502 - Alteração de Internação
    601 - Criação de Leito

    601 - Consultar Log
    602 - Consultar Log de Usuario
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
    const role = req.user.role;
 
    try {

        let logs;
            if (role === 'admin') {//admin pode ver todos os logs
            logs = await Log.find({}, {_id:1, usuario:1, acao:1, descricao:1, createdAt:1})//filtra os campos que serao retornados
                .populate('usuario', 'nome email')
            logController.registrarLog(userId, 601, "Consultar Log", `O Usuario:${userId} consultou todos os logs`)//salva no log
        } else {            
            return res.status(404).json({ message: 'Você não possui permissao.' });//se não for admin não pode ver nenhum log
        }
        if (logs.length === 0) {
            return res.status(404).json({ message: 'Nenhum log encontrado.' });
        }
        return res.status(200).json(logs);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao listar os logs.', error: error.message });
        }
}

static async listarPorUsuario(req, res) {//retorna todos os logs de um usuario
    const userId = req.user.id;
    const role = req.user.role;
    const filtro = req.params.idUsuario
 
    try {

        let logs;
            if (role === 'admin') {//admin pode ver todos os logs
            logs = await Log.find({usuario: filtro}, {_id:1, usuario:1, acao:1, descricao:1, createdAt:1})//filtra os campos que serao retornados
                .populate('usuario', 'nome email')
            logController.registrarLog(userId, 602, "Consultar Log de Usuario", `O Usuario: ${userId} consultou o log do usuario: ${filtro}`)//salva no log
        } else {            
            return res.status(404).json({ message: 'Você não possui permissao.' });//se não for admin não pode ver nenhum log
        }
        if (logs.length === 0) {
            return res.status(404).json({ message: 'Nenhum log encontrado.' });
        }
        return res.status(200).json(logs);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao listar os logs.', error: error.message });
        }
}

static async listarPorAcao(req, res) {//retorna todos os logs com determinada acao
    const userId = req.user.id;
    const role = req.user.role;
    const filtro = req.params.acao
 
    try {

        let logs
        if (role === 'admin') {//admin pode ver todos os logs
        logs = await Log.find({cod:filtro}, {_id:1, usuario:1, cod:1, acao:1, descricao:1, createdAt:1})//filtra os campos que serao retornados
            .populate('usuario', 'nome email')
        logController.registrarLog(userId, 602, "Consultar Log por Ação", `O Usuario: ${userId} consultou o log da acão: ${filtro}`)//salva no log
        } else {            
        return res.status(404).json({ message: 'Você não possui permissao.' });//se não for admin não pode ver nenhum log
        }
        if (logs.length === 0) {
            return res.status(404).json({ message: 'Nenhum log encontrado.' });
        }
        return res.status(200).json(logs);
        } catch (error) {
            return res.status(500).json({ message: 'Erro ao listar os logs.', error: error.message });
        }
}


}
