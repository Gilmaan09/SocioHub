const { createApp } = require('./app')
const { connectDB } = require('./config/db')

const port = process.env.PORT || 4000
const app = createApp()

async function startServer() {
  await connectDB()

  app.listen(port, () => {
    console.log(`SocioHub backend listening on http://localhost:${port}`)
  })
}

startServer()
