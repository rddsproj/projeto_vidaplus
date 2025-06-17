const mongoose = require('../db/conn')
const { Schema } = mongoose

const Receita = mongoose.model(
  'Receita',
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
    medicamentos:[{
      nome:{type:String, required:true},
      quantidade:{type:String, required:true},
      dosagem:{type:String, required:true},
      frequencia:{type:String, required:true},
      observacoes:{type:String, required:true}
    }],
    data: {
      type: Date,
      default: Date.now,
    }
  },
  {timestamps: true}
),
)

module.exports = Receita