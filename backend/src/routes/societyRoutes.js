const express = require('express')
const {
  createSociety,
  getSociety,
  getMySociety,
  updateSociety
} = require('../controllers/societyController')

const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')

const router = express.Router()
const adminOnly = [authMiddleware, authorizeRoles('ADMIN')]

router.post('/', ...adminOnly, createSociety)
const authenticatedUser = [authMiddleware]

router.get('/my-society', ...authenticatedUser, getMySociety)
router.get('/:id', ...adminOnly, getSociety)
router.put('/:id', ...adminOnly, updateSociety)

module.exports = router
