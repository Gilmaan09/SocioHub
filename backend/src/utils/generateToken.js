const jwt = require('jsonwebtoken')

function generateToken(user) {
  const secret = process.env.JWT_SECRET

  if (!secret) {
    throw new Error('JWT_SECRET is not configured')
  }

  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
      societyId: user.societyId?.toString(),
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
  )
}

module.exports = { generateToken }