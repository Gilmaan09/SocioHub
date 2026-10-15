const express = require('express')
const { authMiddleware, authorizeRoles } = require('../middleware/authMiddleware')
const controller = require('../controllers/notificationController')

const router = express.Router()
router.use(authMiddleware, authorizeRoles('ADMIN', 'OWNER', 'TENANT', 'WATCHMAN'))

router.get('/unread-count', controller.getUnreadCount)
router.patch('/read-all', controller.readAll)
router.get('/', controller.getMine)
router.patch('/:id/read', controller.readOne)

module.exports = router
