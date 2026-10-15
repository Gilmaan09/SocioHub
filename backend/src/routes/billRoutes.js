const express = require('express')
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')
const { createMaintenanceBill, getAdminBills, getResidentBill, getResidentBills, payBill } = require('../controllers/billController')

const router = express.Router()
const adminOnly = [authMiddleware, authorizeRoles('ADMIN')]
const residentOnly = [authMiddleware, authorizeRoles('OWNER', 'TENANT')]

router.post('/', ...adminOnly, createMaintenanceBill)
router.get('/', ...adminOnly, getAdminBills)
router.get('/my', ...residentOnly, getResidentBills)
router.get('/my/:id', ...residentOnly, getResidentBill)
router.post('/my/:id/pay', ...residentOnly, payBill)

module.exports = router
