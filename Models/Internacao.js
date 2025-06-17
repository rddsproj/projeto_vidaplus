const mongoose = require('../db/conn')
const { Schema } = mongoose

const Internacao = mongoose.model(
  'Internacao',
  new Schema({
    paciente: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dataEntrada: {
      type: Date,
      default: Date.now,
      required:true,
    },
    dataSaida: {
      type: Date,
    },
    leito: {
      type: Schema.Types.ObjectId,
      ref:'Leito',
      required: true,
    },
    motivo: {
      type: String,
      required: true,
    },
    observacoes: {
      type: String,
    },
    status:{
      type: String,
      enum:["internado", "alta"],
      default: "internado",
      required: true,
    }
  },
  {timestamps: true}
),
)

module.exports = Internacao