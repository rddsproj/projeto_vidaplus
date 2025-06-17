const mongoose = require('../db/conn')
const { Schema } = mongoose

const consultaSchema = new Schema({
  dataHora: { type: Date, required: true },
  paciente: { type: Schema.Types.ObjectId, ref: 'User' },
  medico: { type: Schema.Types.ObjectId, ref: 'User' },
  especialidade: { type: String, required: true },
  status: { type: String, default: 'livre' }
}, { timestamps: true });


const Consulta = mongoose.models.Consulta || mongoose.model('Consulta', consultaSchema);
module.exports = Consulta