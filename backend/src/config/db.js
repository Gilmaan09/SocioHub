const mongoose = require('mongoose')
const dotenv = require('dotenv')
const path = require('node:path')

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/sociohub'

async function connectDB() {
  try {
    await mongoose.connect(mongoUri)
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

module.exports = { connectDB }