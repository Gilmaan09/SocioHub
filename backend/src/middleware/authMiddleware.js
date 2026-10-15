const jwt = require('jsonwebtoken')
const User = require('../models/User')

async function authMiddleware(request, response, next) {
  try {
    const authorization = request.headers.authorization
    const token = authorization?.startsWith('Bearer ')
      ? authorization.slice(7)
      : null

    if (!token) {
      return response.status(401).json({ message: 'Authentication token is required' })
    }

    const secret = process.env.JWT_SECRET

    if (!secret) {
      return response.status(500).json({ message: 'JWT_SECRET is not configured' })
    }

    const decoded = jwt.verify(token, secret)
    const user = await User.findById(decoded.userId).select('-password')

    if (!user || !user.isActive) {
      return response.status(401).json({ message: 'User is not available' })
    }

    request.user = user
    return next()
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return response.status(401).json({ message: 'Invalid or expired token' })
    }

    return next(error)
  }
}

function authorizeRoles(...roles) {
  return (request, response, next) => {
    if (!request.user || !roles.includes(request.user.role)) {
      return response.status(403).json({ message: 'You do not have permission for this action' })
    }

    return next()
  }
}

module.exports = { authMiddleware, authorizeRoles }