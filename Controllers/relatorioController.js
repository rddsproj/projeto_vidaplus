const Consulta = require('../Models/Consulta')
const Internacao = require('../Models/Internacao')
const Leito = require('../Models/Leito')
const logController = require('./logController')

module.exports = class relatorioController {

    static async relatorioConsultas(req,res){
        const tokenRole = req.user.role;

        if(tokenRole === 'admin'){
            try{
            //CONTA A QUANTIDADE DE DOCUMENTOS QUE TEM NA COLLECTION CONSULTA
            const totalConsultas = await Consulta.countDocuments();
            //AGRUPA AS CONSULTA PELO CAMPO STATUS E SOMA A QUANTIDADE
            const porStatus = await Consulta.aggregate([
                { $group: {_id: "$status", total:{ $sum: 1 }}}
            ]);
            //AGRUPA AS CONSULTAS PELO CAMPO ESPECIALIDADE E E SOMA A QUANTIDADE
            const porEspecialidade = await Consulta.aggregate([
                { $group: {_id: "$especialidade", total:{ $sum: 1 }}}
            ]);
            //AGRUPA AS CONSULTAS PELO CAMPO DATAHORA E SOMA A QUANTIDADE
            const porDia = await Consulta.aggregate([
                { $group: {_id: {
                    $dateToString:{
                        format: "%Y-%m-%d",
                        date: "$dataHora"
                    }
                },
            total: { $sum: 1 }
        }
    }
            ]);
            //OBJETO PARA O RESULTADO
            const resultado = {
                totalConsultas,
                consultasPorStatus:{},
                consultasPorEspecialidade:{},
                consultasPorData: {}
            };

            //PREENCHE O OBJETO
            porStatus.forEach(i => {resultado.consultasPorStatus[i._id] = i.total;});
            porEspecialidade.forEach(i => {resultado.consultasPorEspecialidade[i._id] = i.total;});
            porDia.forEach(i => {resultado.consultasPorData[i._id] = i.total;});
            return res.status(200).json(resultado);

        }catch(err){
            return res.status(500).json({ message: "Erro ao gerar relatório.", error: err.message });
        }}else{
            return res.status(403).json({message:"Você não possui permissao para acessar os relatorios de consultas"})
        }

    }

    static async relatorioInternacao(req,res){
        const tokenRole = req.user.role;
        if(tokenRole === 'admin'){
        try{
            //CONTA A QUANTIDADE DE DOCUMENTOS QUE TEM NA COLLECTION INTERNACAO
            const totalInternacoes = await Internacao.countDocuments()
            //AGRUPA AS INTERNACOES PELO CAMPO STATUS E SOMA A QUANTIDADE
            const porStatus = await Internacao.aggregate([
                { $group: {_id: "$status", total:{ $sum: 1 }}}
            ])
            //AGRUPA AS CONSULTAS PELO CAMPO MOTIVO E SOMA A QUANTIDADE
            const porMotivo = await Internacao.aggregate([
                { $group: {_id: "$motivo", total:{ $sum: 1 }}}
            ])
            //AGRUPA AS CONSULTAS PELA DATA DE ENTRADA E SOMA A QUANTIDADE
            const porDiaEntrada = await Internacao.aggregate([
                { $group: {_id: {
                    $dateToString:{
                        format: "%Y-%m-%d",
                        date: "$dataEntrada"
                    }
                },
            total: { $sum: 1 }
        }
    }
            ])
            //AGRUPA AS CONSULTAS PELA DATA DE SAIDA E SOMA A QUANTIDADE
            const porDiaSaida = await Internacao.aggregate([
                {
                    $match:{
                        //FILTRA APENAS AS DATAS DE SAIDAS QUE NÃO SÃO NULL
                        dataSaida:{ $ne:null}
                    }
                },
                { $group: {_id: {
                    $dateToString:{
                        format: "%Y-%m-%d",
                        date: "$dataSaida"
                    }
                },
            total: { $sum: 1 }
        }
    }
            ]);

            //OBJETO PARA O RESULTADO
            const resultado = {
                totalInternacoes,
                internacaoPorStatus:{},
                internacaoPorMotivo:{},
                internacaoPorEntrada: {},
                internacaoPorSaida: {}
            };

            //PREENCHE O OBJETO
            porStatus.forEach(i => {resultado.internacaoPorStatus[i._id] = i.total;});
            porMotivo.forEach(i => {resultado.internacaoPorMotivo[i._id] = i.total;});
            porDiaEntrada.forEach(i => {resultado.internacaoPorEntrada[i._id] = i.total;});
            porDiaSaida.forEach(i => {resultado.internacaoPorSaida[i._id] = i.total;});

            return res.status(200).json(resultado);

        }catch(err){
            return res.status(500).json({ message: "Erro ao gerar relatório.", error: err.message });
        }
        }else{
            return res.status(403).json({message:"Você não possui permissao para acessar os relatorios de Internações"})
        }
    }

    static async relatorioLeito(req,res){
        const tokenRole = req.user.role;

        if(tokenRole === 'admin'){
        try{
            //CONTA A QUANTIDADE DE DOCUMENTOS QUE TEM NA COLLECTION LEITO
            const totalLeitos= await Leito.countDocuments();
            //AGRUPA AS CONSULTA PELO CAMPO STATUS E SOMA A QUANTIDADE
            const porStatus = await Leito.aggregate([
                { $group: {_id: "$status", total:{ $sum: 1 }}}
            ]);

            //OBJETO PARA O RESULTADO
            const resultado = {
                totalLeitos,
                leitosPorStatus:{}
            };
            //PREENCHE O OBJETO
            porStatus.forEach(i => {resultado.leitosPorStatus[i._id] = i.total;});
            return res.status(200).json(resultado);

        }catch(err){
            return res.status(500).json({ message: "Erro ao gerar relatório.", error: err.message });
        }

    }else{
            return res.status(403).json({message:"Você não possui permissao para acessar os relatorios de Leitos"})
        }

}}