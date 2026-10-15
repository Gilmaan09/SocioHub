const bcrypt = require('bcryptjs')

const User = require('../models/User')
const Society = require('../models/Society')
const { generateToken } = require('../utils/generateToken')

function userResponse(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    dutyLocation: user.dutyLocation,
    role: user.role,
    societyId: user.societyId,
    flatId: user.flatId,
    mustChangePassword: user.mustChangePassword,
  }
}

async function registerSociety(request, response, next) {
  try {
    const {
      societyName,
      societyAddress,
      societyEmail,
      societyPhone,
      adminName,
      adminEmail,
      adminPhone,
      password,
    } = request.body

    if (
      !societyName ||
      !societyAddress ||
      !adminName ||
      !adminEmail ||
      !password
    ) {
      return response.status(400).json({
        message:
          'Society name, society address, admin name, admin email, and password are required',
      })
    }

    const existingUser = await User.findOne({
      email: adminEmail.toLowerCase(),
    })

    if (existingUser) {
      return response.status(409).json({
        message: 'A user with this email already exists',
      })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const society = await Society.create({
      name: societyName,
      address: societyAddress,
      email: societyEmail,
      phone: societyPhone,
    })

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      phone: adminPhone,
      password: hashedPassword,
      role: 'ADMIN',
      societyId: society._id,
      mustChangePassword: false,
    })

    return response.status(201).json({
      message: 'Society registered successfully',
      society,
      user: userResponse(admin),
    })
  } catch (error) {
    return next(error)
  }
}

async function login(request, response, next) {
  try {
    const { email, password } = request.body

    if (!email || !password) {
      return response.status(400).json({
        message: 'Email and password are required',
      })
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    }).select('+password')

    if (!user) {
      return response.status(401).json({
        message: 'Invalid email or password',
      })
    }

    if (!user.isActive) {
      return response.status(403).json({
        message: 'Your account is inactive',
      })
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    )

    if (!passwordMatches) {
      return response.status(401).json({
        message: 'Invalid email or password',
      })
    }

    return response.json({
      message: 'Login successful',
      token: generateToken(user),
      user: userResponse(user),
    })
  } catch (error) {
    return next(error)
  }
}

function getCurrentUser(request, response) {
  return response.json({
    user: userResponse(request.user),
  })
}

async function updateProfile(request, response, next) {
  try {
    const { name, email, phone } = request.body
    if (!name?.trim() || !email?.trim()) return response.status(400).json({ message: 'Name and email are required' })
    const user = await User.findByIdAndUpdate(request.user._id, {
      name: name.trim(), email: email.trim().toLowerCase(), phone: phone?.trim() || '',
    }, { new: true, runValidators: true })
    if (!user) return response.status(404).json({ message: 'User not found' })
    return response.json({ user: userResponse(user) })
  } catch (error) { return next(error) }
}

async function changePassword(request, response, next) {
  try {
    const userId = request.user._id

    const {
      currentPassword,
      newPassword,
    } = request.body

    if (!currentPassword || !newPassword) {
      return response.status(400).json({
        message:
          'Current password and new password are required',
      })
    }

    if (newPassword.length < 6) {
      return response.status(400).json({
        message:
          'New password must be at least 6 characters long',
      })
    }

    const user = await User.findById(userId).select(
      '+password'
    )

    if (!user) {
      return response.status(404).json({
        message: 'User not found',
      })
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    )

    if (!passwordMatches) {
      return response.status(400).json({
        message: 'Current password is incorrect',
      })
    }

    user.password = await bcrypt.hash(
      newPassword,
      12
    )

    user.mustChangePassword = false

    await user.save()

    return response.json({
      message: 'Password changed successfully',
      user: userResponse(user),
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  registerSociety,
  login,
  getCurrentUser,
  updateProfile,
  changePassword,
}
