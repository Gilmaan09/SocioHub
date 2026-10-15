const express = require('express')

const {
  startDuty,
  endDuty,
  getCurrentDuty,
  getMyAttendance,
  getSocietyAttendance,
} = require('../controllers/watchmanAttendanceController')

const {
  authMiddleware,
  authorizeRoles,
} = require('../middleware/authMiddleware')

const router = express.Router()

const watchmanOnly = [
  authMiddleware,
  authorizeRoles('WATCHMAN'),
]

const adminOnly = [
  authMiddleware,
  authorizeRoles('ADMIN'),
]

// Watchman routes
router.post('/start', ...watchmanOnly, startDuty)
router.post('/end', ...watchmanOnly, endDuty)
router.get('/current', ...watchmanOnly, getCurrentDuty)
router.get('/my', ...watchmanOnly, getMyAttendance)

// Admin route
router.get('/', ...adminOnly, getSocietyAttendance)

module.exports = router