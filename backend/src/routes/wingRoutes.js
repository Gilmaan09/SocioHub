const express = require('express')
const { createWing, deleteWing, getWings, updateWing } = require('../controllers/wingController')
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')

const router = express.Router()
const adminOnly = [authMiddleware, authorizeRoles('ADMIN')]

router.post('/', ...adminOnly, createWing)
router.get('/', ...adminOnly, getWings)
router.put('/:id', ...adminOnly, updateWing)
router.delete('/:id', ...adminOnly, deleteWing)

module.exports = router
