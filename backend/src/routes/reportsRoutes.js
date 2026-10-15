const express = require('express')
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')
const { getReports } = require('../controllers/reportsController')

const router = express.Router()
router.get('/', authMiddleware, authorizeRoles('ADMIN'), getReports)

module.exports = router
