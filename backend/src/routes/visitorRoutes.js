const express = require('express')

const {
  createVisitor,
  getTodayVisitors,
  getWaitingVisitors,
  getMyFlatVisitors,
  approveVisitor,
  rejectVisitor,
  markVisitorEntry,
  markVisitorExit,
} = require('../controllers/visitorController')

const {
  authMiddleware,
  authorizeRoles,
} = require('../middleware/authMiddleware')

const router = express.Router()

const watchmanOnly = [
  authMiddleware,
  authorizeRoles('WATCHMAN'),
]

const residentOnly = [
  authMiddleware,
  authorizeRoles('OWNER', 'TENANT'),
]


// ==============================
// WATCHMAN ROUTES
// ==============================

// Register visitor
router.post(
  '/',
  ...watchmanOnly,
  createVisitor
)

// Today's visitors
router.get(
  '/today',
  ...watchmanOnly,
  getTodayVisitors
)

// Visitors waiting for approval
router.get(
  '/waiting',
  ...watchmanOnly,
  getWaitingVisitors
)

// Mark approved visitor as entered
router.patch(
  '/:id/entry',
  ...watchmanOnly,
  markVisitorEntry
)

// Mark visitor as exited
router.patch(
  '/:id/exit',
  ...watchmanOnly,
  markVisitorExit
)


// ==============================
// RESIDENT ROUTES
// ==============================

// Visitors for resident's flat
router.get(
  '/my-flat',
  ...residentOnly,
  getMyFlatVisitors
)

// Approve visitor
router.patch(
  '/:id/approve',
  ...residentOnly,
  approveVisitor
)

// Reject visitor
router.patch(
  '/:id/reject',
  ...residentOnly,
  rejectVisitor
)


module.exports = router
