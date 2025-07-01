const mongoose = require('../db/conn')
const { Schema } = mongoose

const User = mongoose.model(
  'User',
  new Schema({
    nome: {
      type: String,
      required: true,
    },
    sobrenome: {
      type: String,
      required: true,
    },
    cpf: {
      type: String,
      required: true,
    },
    dataNascimento: {
      type: Date,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    telefone: {
      type: String,
      required: true,
    },
    senha: {
      type: String,
      required: true,
    },
    endereco: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'paciente', 'medico', 'atendente', 'enfermeiro'],
      default: 'paciente',
      required: true,
    }
  },
  {timestamps: true}
),
)

module.exports = User