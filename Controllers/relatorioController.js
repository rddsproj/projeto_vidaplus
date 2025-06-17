const Consulta = require('../Models/Consulta')
const Internacao = require('../Models/Internacao')
const Leito = require('../Models/Leito')
const logController = require('./logController')

module.exports = class relatorioController {

    static async relatorioConsultas(req,res){

        try{
            const totalConsultas = await Consulta.countDocuments()//conta todos os documentos na collection Consulta, que é o total de consultas no banco de dados

            const porStatus = await Consulta.aggregate([//agrupa as consultas pelo campo status e soma a quantidade
                { $group: {_id: "$status", total:{ $sum: 1 }}}
            ])

            const porEspecialidade = await Consulta.aggregate([//agrupa as consultas pelo campo especialidade e soma a quantidade
                { $group: {_id: "$especialidade", total:{ $sum: 1 }}}
            ])

            const porDia = await Consulta.aggregate([//agrupa as consultas pelo campo dataHora e soma a quantidade
                { $group: {_id: {
                    $dateToString:{
                        format: "%Y-%m-%d",
                        date: "$dataHora"
                    }
                },
            total: { $sum: 1 }
        }
    }
            ])
            const resultado = {//objeto para o resultado
                totalConsultas,
                consultasPorStatus:{},
                consultasPorEspecialidade:{},
                consultasPorDia: {}
            }


            porStatus.forEach(i => {//percorre cada item e preenche o objeto resultado
                resultado.consultasPorStatus[i._id] = i.total;
            });

            porEspecialidade.forEach(i => {
                resultado.consultasPorEspecialidade[i._id] = i.total;
            });

            porDia.forEach(i => {
                resultado.consultasPorDia[i._id] = i.total;
            });

            return res.status(200).json(resultado);//retorna o resultado

        }catch(err){
            return res.status(500).json({ message: "Erro ao gerar relatório.", error: err.message });
        }

    }


    static async relatorioInternacao(req,res){

        try{
            const totalInternacoes = await Internacao.countDocuments()//conta todos os documentos na collection Consulta, que é o total de consultas no banco de dados

            const porStatus = await Internacao.aggregate([//agrupa as internações por status (internado e alta)
                { $group: {_id: "$status", total:{ $sum: 1 }}}
            ])

            const porMotivo = await Internacao.aggregate([//agrupa as consultas pelo campo especialidade e soma a quantidade
                { $group: {_id: "$motivo", total:{ $sum: 1 }}}
            ])

            const porDiaEntrada = await Internacao.aggregate([//agrupa as consultas pelo campo dataHora e soma a quantidade
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

            const porDiaSaida = await Internacao.aggregate([//agrupa as consultas pelo campo dataHora e soma a quantidade
                {
                    $match:{
                        dataSaida:{ $ne:null}//filtra apenas as datas de saidas que não são null
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
            ])


            const resultado = {//objeto para o resultado
                totalInternacoes,
                internacaoPorStatus:{},
                internacaoPorMotivo:{},
                internacaoPorEntrada: {},
                internacaoPorSaida: {}
            }


            porStatus.forEach(i => {//percorre cada item e preenche o objeto resultado
                resultado.internacaoPorStatus[i._id] = i.total;
            });

            porMotivo.forEach(i => {
                resultado.internacaoPorMotivo[i._id] = i.total;
            });

            porDiaEntrada.forEach(i => {
                resultado.internacaoPorEntrada[i._id] = i.total;
            });

            porDiaSaida.forEach(i => {
                resultado.internacaoPorSaida[i._id] = i.total;
            });

            return res.status(200).json(resultado);//retorna o resultado

        }catch(err){
            return res.status(500).json({ message: "Erro ao gerar relatório.", error: err.message });
        }

    }

    static async relatorioLeito(req,res){

        try{
            const totalLeitos= await Leito.countDocuments()//conta todos os documentos na collection Consulta, que é o total de consultas no banco de dados

            const porStatus = await Leito.aggregate([//agrupa as consultas pelo campo status e soma a quantidade
                { $group: {_id: "$status", total:{ $sum: 1 }}}
            ])




            const resultado = {//objeto para o resultado
                totalLeitos,
                leitosPorStatus:{}
            }


            porStatus.forEach(i => {//percorre cada item e preenche o objeto resultado
                resultado.leitosPorStatus[i._id] = i.total;
            })

            return res.status(200).json(resultado);//retorna o resultado

        }catch(err){
            return res.status(500).json({ message: "Erro ao gerar relatório.", error: err.message });
        }

    }

}