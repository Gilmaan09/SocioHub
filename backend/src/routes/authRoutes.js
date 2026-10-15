const express = require('express')

const {
  getCurrentUser,
  updateProfile,
  login,
  registerSociety,
  changePassword
} = require('../controllers/authController')

const { authMiddleware } = require('../middleware/authMiddleware')

const router = express.Router()

router.post('/register-society', registerSociety)

router.post('/login', login)

router.get('/me', authMiddleware, getCurrentUser)
router.put('/profile', authMiddleware, updateProfile)

router.put('/change-password', authMiddleware, changePassword)

module.exports = router

// const express = require('express')
// const {
//   getCurrentUser,
//   login,
//   register,
// } = require('../controllers/authController')
// const { authMiddleware } = require('../middleware/authMiddleware')

// const router = express.Router()

// router.post('/register', register)
// router.post('/login', login)
// router.get('/me', authMiddleware, getCurrentUser)

// module.exports = router
