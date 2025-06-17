const mongoose = require('mongoose')
require('dotenv').config()

async function main() {
  await mongoose.connect(process.env.MONGODB_URI)
  console.log('Conectou com Mongoose!')
}

main().catch((err) => console.log(err))

module.exports = mongoose
