const express = require('express')
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')
const controller = require('../controllers/financeController')

const router = express.Router()
router.use(authMiddleware, authorizeRoles('ADMIN'))

router.get('/summary', controller.summary)
router.get('/transactions', controller.transactions)
router.post('/opening-balance', controller.createOpeningBalance)
router.post('/transactions', controller.createTransaction)

module.exports = router
