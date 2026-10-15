const express = require('express')
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')
const controller = require('../controllers/complaintController')

const router = express.Router()
const residentOnly = [authMiddleware, authorizeRoles('OWNER', 'TENANT')]
const adminOnly = [authMiddleware, authorizeRoles('ADMIN')]

router.post('/', ...residentOnly, controller.create)
router.get('/my', ...residentOnly, controller.getMine)
router.get('/my/:id', ...residentOnly, controller.getMineById)
router.get('/', ...adminOnly, controller.getAll)
router.put('/:id', ...adminOnly, controller.update)
router.delete('/:id', ...adminOnly, controller.remove)

module.exports = router
