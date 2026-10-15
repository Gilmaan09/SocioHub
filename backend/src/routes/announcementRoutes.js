const express = require('express')
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')
const controller = require('../controllers/announcementController')

const router = express.Router()
const adminOnly = [authMiddleware, authorizeRoles('ADMIN')]
const residentOnly = [authMiddleware, authorizeRoles('OWNER', 'TENANT')]

router.post('/', ...adminOnly, controller.create)
router.get('/my', ...residentOnly, controller.getMine)
router.get('/my/:id', ...residentOnly, controller.getMineOne)
router.get('/', ...adminOnly, controller.getAll)
router.get('/:id', ...adminOnly, controller.getOne)
router.put('/:id', ...adminOnly, controller.update)
router.delete('/:id', ...adminOnly, controller.remove)

module.exports = router
