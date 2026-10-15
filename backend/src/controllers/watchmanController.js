const User = require('../models/User')
const bcrypt = require('bcryptjs')
const WatchmanAttendance = require('../models/WatchmanAttendance')
const {
  getAdminSocietyId,
  isValidId,
  pickFields,
} = require('../utils/structureControllerUtils')

const watchmanRole = 'WATCHMAN'

function safeWatchman(user) {
  const watchman = user.toObject
    ? user.toObject()
    : { ...user }

  delete watchman.password

  return watchman
}

async function getWatchmanOrNotFound(
  watchmanId,
  societyId
) {
  if (!isValidId(watchmanId)) return null

  return User.findOne({
    _id: watchmanId,
    societyId,
    role: watchmanRole,
  })
}

async function createWatchman(request, response, next) {
  try {
    const societyId = getAdminSocietyId(
      request,
      response
    )

    if (!societyId) return undefined

    const {
      name,
      email,
      phone,
      password,
      dutyLocation,
    } = request.body

    if (!name || !email || !password) {
      return response.status(400).json({
        message:
          'Name, email, and password are required',
      })
    }

    if (
      await User.exists({
        email: email.toLowerCase(),
      })
    ) {
      return response.status(409).json({
        message:
          'A user with this email already exists',
      })
    }

    const watchman = await User.create({
      name,
      email,
      phone,
      dutyLocation,
      role: watchmanRole,
      societyId,
      password: await bcrypt.hash(password, 12),
      mustChangePassword: true,
    })

    return response.status(201).json({
      watchman: safeWatchman(watchman),
    })
  } catch (error) {
    return next(error)
  }
}

async function listWatchmen(
  request,
  response,
  next
) {
  try {
    const societyId = getAdminSocietyId(
      request,
      response
    )

    if (!societyId) return undefined

    const watchmen = await User.find({
      societyId,
      role: watchmanRole,
    })
      .select('-password')
      .sort({ name: 1 })

    return response.json({ watchmen })
  } catch (error) {
    return next(error)
  }
}

async function getWatchman(
  request,
  response,
  next
) {
  try {
    const societyId = getAdminSocietyId(
      request,
      response
    )

    if (!societyId) return undefined

    const watchman =
      await getWatchmanOrNotFound(
        request.params.id,
        societyId
      )

    if (!watchman) {
      return response.status(404).json({
        message: 'Watchman not found',
      })
    }

    return response.json({
      watchman: safeWatchman(watchman),
    })
  } catch (error) {
    return next(error)
  }
}

async function updateWatchman(
  request,
  response,
  next
) {
  try {
    const societyId = getAdminSocietyId(
      request,
      response
    )

    if (!societyId) return undefined

    const watchman =
      await getWatchmanOrNotFound(
        request.params.id,
        societyId
      )

    if (!watchman) {
      return response.status(404).json({
        message: 'Watchman not found',
      })
    }

    const data = pickFields(
      request.body,
      [
        'name',
        'phone',
        'email',
        'dutyLocation',
        'isActive',
      ]
    )

    if (data.email) {
      data.email = data.email.toLowerCase()
    }

    Object.assign(watchman, data)

    await watchman.save()

    return response.json({
      watchman: safeWatchman(watchman),
    })
  } catch (error) {
    return next(error)
  }
}

async function deleteWatchman(
  request,
  response,
  next
) {
  try {
    const societyId = getAdminSocietyId(
      request,
      response
    )

    if (!societyId) return undefined

    const watchman =
      await getWatchmanOrNotFound(
        request.params.id,
        societyId
      )

    if (!watchman) {
      return response.status(404).json({
        message: 'Watchman not found',
      })
    }

    await User.findByIdAndDelete(watchman._id)

    return response.json({
      message: 'Watchman deleted successfully',
    })
  } catch (error) {
    return next(error)
  }
}

async function getResidentWatchmen(request, response, next) {
  try {
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message: 'You are not assigned to a society',
      })
    }

    const watchmen = await User.find({
      societyId,
      role: watchmanRole,
      isActive: true,
    })
      .select('-password')
      .sort({ name: 1 })

    const watchmenWithDuty = await Promise.all(
      watchmen.map(async (watchman) => {
        const activeDuty =
          await WatchmanAttendance.findOne({
            watchmanId: watchman._id,
            societyId,
            status: 'ON_DUTY',
            dutyEnd: null,
          }).sort({ dutyStart: -1 })

        return {
          ...watchman.toObject(),
          onDuty: Boolean(activeDuty),
          dutyStart: activeDuty
            ? activeDuty.dutyStart
            : null,
        }
      })
    )

    return response.json({
      watchmen: watchmenWithDuty,
    })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createWatchman,
  listWatchmen,
  getWatchman,
  updateWatchman,
  deleteWatchman,
  getResidentWatchmen,
}