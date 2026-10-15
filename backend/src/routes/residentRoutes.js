const express = require('express')
const { createResident, getResident, listResidents, removeAssignment, updateResident } = require('../controllers/residentController')
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')

const router = express.Router()
const adminOnly = [authMiddleware, authorizeRoles('ADMIN')]

router.post('/', ...adminOnly, createResident)
router.get('/', ...adminOnly, listResidents)
router.get('/:id', ...adminOnly, getResident)
router.put('/:id', ...adminOnly, updateResident)
router.delete('/:id/assignment', ...adminOnly, removeAssignment)

module.exports = router
