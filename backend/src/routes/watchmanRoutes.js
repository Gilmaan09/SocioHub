const express = require('express')

const {
  createWatchman,
  listWatchmen,
  getWatchman,
  updateWatchman,
  deleteWatchman,
  getResidentWatchmen,
} = require('../controllers/watchmanController')

const {
  authMiddleware,
  authorizeRoles,
} = require('../middleware/authMiddleware')

const router = express.Router()

const adminOnly = [
  authMiddleware,
  authorizeRoles('ADMIN'),
]

const residentOnly = [
  authMiddleware,
  authorizeRoles('OWNER', 'TENANT'),
]

// Admin routes
router.post(
  '/',
  ...adminOnly,
  createWatchman
)

router.get(
  '/',
  ...adminOnly,
  listWatchmen
)

// Resident route
router.get(
  '/resident',
  ...residentOnly,
  getResidentWatchmen
)

// Admin single-watchman routes
router.get(
  '/:id',
  ...adminOnly,
  getWatchman
)

router.put(
  '/:id',
  ...adminOnly,
  updateWatchman
)

router.delete(
  '/:id',
  ...adminOnly,
  deleteWatchman
)

module.exports = router