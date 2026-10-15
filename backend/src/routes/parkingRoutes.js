const express = require('express')
const { createParking, deleteParking, getParking, updateParking } = require('../controllers/parkingController')
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')

const router = express.Router()
const adminOnly = [authMiddleware, authorizeRoles('ADMIN')]

router.post('/', ...adminOnly, createParking)
router.get('/', ...adminOnly, getParking)
router.put('/:id', ...adminOnly, updateParking)
router.delete('/:id', ...adminOnly, deleteParking)

module.exports = router
