const mongoose = require('../db/conn')
const { Schema } = mongoose

const Prontuario = mongoose.model(
  'Prontuario',
  new Schema({
    paciente: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    medico: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    anamnese: {
      type: String,
      required: true,
    },
    hipotese: {
      type: String,
      required: true,
    },
    conduta: {
      type: String,
      required: true,
    },
    observacao: {
      type: String,
      required: true,
    },
    data: {
      type: Date,
      default: Date.now,
    }
  },
  {timestamps: true}
),
)

module.exports = Prontuario