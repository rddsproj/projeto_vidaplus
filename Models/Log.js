const mongoose = require('../db/conn')
const { Schema } = mongoose

const Log = mongoose.model(
  'Log',
  new Schema({
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cod: {
      type: Number,
      required: true,
    },
    acao: {
      type: String,
      required: true,
    },
    descricao: {
      type: String,
      required: true,
    },
    data: {
      type: Date,
      default: Date.now,
    },
  },
  {timestamps: true}
),
)

module.exports = Log