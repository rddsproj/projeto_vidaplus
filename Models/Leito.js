const mongoose = require('../db/conn')
const { Schema } = mongoose

const Leito = mongoose.model(
  'Leito',
  new Schema({
    numero: {
      type: Number,
      required: true,
    },
    paciente: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    dataEntrada: {
      type: Date,
    },
    dataSaida: {
      type: Date,
    },
    status:{
      type: String,
      enum:["livre", "ocupado"],
      default: "livre",
      required: true,
    }
  },
  {timestamps: true}
),
)

module.exports = Leito