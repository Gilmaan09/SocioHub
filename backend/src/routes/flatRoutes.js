const express = require('express')

const {
  createFlat,
  deleteFlat,
  getFlats,
  getMyFlat,
  updateFlat
} = require('../controllers/flatController')

const {
  authMiddleware,
  authorizeRoles
} = require('../middleware/authMiddleware')

const router = express.Router()

const adminOnly = [
  authMiddleware,
  authorizeRoles('ADMIN')
]

const residentOnly = [
  authMiddleware,
  authorizeRoles('OWNER', 'TENANT')
]

const flatViewer = [
  authMiddleware,
  authorizeRoles('ADMIN', 'WATCHMAN')
]

router.post(
  '/',
  ...adminOnly,
  createFlat
)

router.get(
  '/',
  ...flatViewer,
  getFlats
)

router.get(
  '/my-flat',
  ...residentOnly,
  getMyFlat
)

router.put(
  '/:id',
  ...adminOnly,
  updateFlat
)

router.delete(
  '/:id',
  ...adminOnly,
  deleteFlat
)

module.exports = router