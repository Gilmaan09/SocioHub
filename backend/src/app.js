const cors = require('cors')
const express = require('express')
const authRoutes = require('./routes/authRoutes')
const societyRoutes = require('./routes/societyRoutes')
const wingRoutes = require('./routes/wingRoutes')
const flatRoutes = require('./routes/flatRoutes')
const parkingRoutes = require('./routes/parkingRoutes')
const residentRoutes = require('./routes/residentRoutes')
const watchmanRoutes = require('./routes/watchmanRoutes')
const watchmanAttendanceRoutes = require('./routes/watchmanAttendanceRoutes')
const billRoutes = require('./routes/billRoutes')
const complaintRoutes = require('./routes/complaintRoutes')
const announcementRoutes = require('./routes/announcementRoutes')
const communityRoutes = require('./routes/communityRoutes')
const visitorRoutes = require('./routes/visitorRoutes')
const notificationRoutes = require('./routes/notificationRoutes')
const financeRoutes = require('./routes/financeRoutes')
const reportsRoutes = require('./routes/reportsRoutes')
function createApp() {
  const app = express()

  const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : ['http://localhost:5173', 'http://127.0.0.1:5173']

  app.use(cors({
    origin(origin, callback) {
      // Non-browser requests (CLI tools and server-to-server calls) have no Origin.
      callback(null, !origin || allowedOrigins.includes(origin))
    },
  }))
  app.use(express.json())

  app.get('/api/health', (request, response) => {
    response.json({
      status: 'ok',
      service: 'sociohub-backend',
    })
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/societies', societyRoutes)
  app.use('/api/wings', wingRoutes)
  app.use('/api/flats', flatRoutes)
  app.use('/api/parking', parkingRoutes)
  app.use('/api/residents', residentRoutes)
  app.use('/api/watchmen', watchmanRoutes)
  app.use('/api/bills', billRoutes)
  app.use('/api/complaints', complaintRoutes)
  app.use('/api/announcements', announcementRoutes)
  app.use('/api/community', communityRoutes)
  app.use('/api/visitors', visitorRoutes)
  app.use('/api/notifications', notificationRoutes)
  app.use('/api/finance', financeRoutes)
  app.use('/api/reports', reportsRoutes)
  app.use(
    '/api/watchman-attendance',
    watchmanAttendanceRoutes
  )

  app.use((error, request, response, next) => {
    console.error(error)

    if (error.code === 11000) {
      return response.status(409).json({
        message:
          'A record with the same unique value already exists',
      })
    }

    if (error.name === 'ValidationError') {
      return response.status(400).json({
        message: error.message,
      })
    }

    response.status(500).json({
      message: 'Internal server error',
    })
  })

  return app
}

module.exports = { createApp }
