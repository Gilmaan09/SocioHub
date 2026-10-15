const Flat = require('../models/Flat')
const User = require('../models/User')
const Wing = require('../models/Wing')
const bcrypt = require('bcryptjs')
const { getAdminSocietyId, isValidId, pickFields } = require('../utils/structureControllerUtils')

const residentRoles = ['OWNER', 'TENANT']

function safeResident(user) {
  const resident = user.toObject ? user.toObject() : { ...user }
  delete resident.password
  return resident
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function getResidentOrNotFound(residentId, societyId) {
  if (!isValidId(residentId)) return null
  return User.findOne({ _id: residentId, societyId, role: { $in: residentRoles } })
}

async function clearResidentAssignment(user) {
  if (!user.flatId) return
  const assignmentField = user.role === 'OWNER' ? 'ownerId' : 'tenantId'
  await Flat.findOneAndUpdate({ _id: user.flatId, [assignmentField]: user._id }, { $unset: { [assignmentField]: 1 } })
}

async function getFlatOccupants(flat, assignmentField, societyId, residentId) {
  const role = assignmentField === 'ownerId' ? 'OWNER' : 'TENANT'
  const occupants = await User.find({
    societyId,
    role,
    flatId: flat._id,
    ...(residentId ? { _id: { $ne: residentId } } : {}),
  }).select('name role')

  if (flat[assignmentField] && flat[assignmentField].toString() !== String(residentId || '')) {
    const linkedOccupant = await User.findOne({ _id: flat[assignmentField], societyId, role }).select('name role')
    if (!occupants.some((occupant) => occupant._id.toString() === flat[assignmentField].toString())) {
      occupants.push(linkedOccupant || { _id: flat[assignmentField], name: 'Another resident', role })
    }
  }

  return occupants
}

async function assignmentConflict(flat, assignmentField, societyId, residentId) {
  const occupants = await getFlatOccupants(flat, assignmentField, societyId, residentId)
  await flat.populate('wingId', 'name')
  return {
    code: 'FLAT_ALREADY_ASSIGNED',
    message: occupants.length
      ? `${flat.wingId?.name ? `Wing ${flat.wingId.name} - ` : ''}${flat.number} already has an assigned ${occupants.map((occupant) => occupant.role.toLowerCase()).join(' and ')}.`
      : 'This flat assignment changed while you were saving. Please review it and try again.',
    assignedResidents: occupants.map((occupant) => ({ id: occupant._id.toString(), name: occupant.name, role: occupant.role })),
    assignedResident: occupants[0] ? { id: occupants[0]._id.toString(), name: occupants[0].name, role: occupants[0].role } : null,
    flatLabel: `${flat.wingId?.name ? `Wing ${flat.wingId.name} - ` : ''}${flat.number}`,
  }
}

function sendAssignmentError(response, error) {
  if (typeof error === 'object' && error.code === 'FLAT_ALREADY_ASSIGNED') {
    return response.status(409).json(error)
  }
  return response.status(400).json({ message: error })
}

async function assignResidentToFlat(user, flatId, societyId, replaceAssignmentOf) {
  if (flatId === null || flatId === undefined || flatId === '') {
    await clearResidentAssignment(user)

    user.flatId = undefined

    await user.save()

    return null
  }

  if (!isValidId(flatId)) {
    return 'A valid flatId is required'
  }

  const flat = await Flat.findOne({
    _id: flatId,
    societyId
  })

  if (!flat) {
    return 'Flat not found in this society'
  }

  const assignmentField =
    user.role === 'OWNER' ? 'ownerId' : 'tenantId'

  const previousResidentId = flat[assignmentField]
  const occupants = await getFlatOccupants(flat, assignmentField, societyId, user._id)
  const confirmedIds = Array.isArray(replaceAssignmentOf)
    ? replaceAssignmentOf.map(String)
    : replaceAssignmentOf ? [String(replaceAssignmentOf)] : []
  const unconfirmedOccupant = occupants.find((occupant) => !confirmedIds.includes(occupant._id.toString()))
  if (unconfirmedOccupant) return assignmentConflict(flat, assignmentField, societyId, user._id)

  const claimedFlat = await Flat.findOneAndUpdate(
    { _id: flat._id, societyId, [assignmentField]: previousResidentId || null },
    { $set: { [assignmentField]: user._id } },
    { new: true },
  )

  if (!claimedFlat) {
    const latestFlat = await Flat.findOne({ _id: flat._id, societyId })
    if (!latestFlat) return 'Flat not found in this society'
    return assignmentConflict(latestFlat, assignmentField, societyId, user._id)
  }

  for (const occupant of occupants) {
    await User.findOneAndUpdate(
      { _id: occupant._id, societyId, flatId: flat._id },
      { $unset: { flatId: 1 } },
    )
  }

  if (user.flatId && user.flatId.toString() !== flat._id.toString()) {
    await clearResidentAssignment(user)
  }

  user.flatId = flat._id
  user.societyId = societyId

  await user.save()

  return null
}

async function createResident(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    const { name, email, phone, password, role = 'OWNER', flatId, replaceAssignmentOf } = request.body
    if (!name || !email || !password) return response.status(400).json({ message: 'Name, email, and password are required' })
    if (!residentRoles.includes(role)) return response.status(400).json({ message: 'Only OWNER or TENANT residents can be created here' })
    if (await User.exists({ email: email.toLowerCase() })) return response.status(409).json({ message: 'A user with this email already exists' })

    if (flatId !== undefined && flatId !== null && flatId !== '') {
      if (!isValidId(flatId)) return response.status(400).json({ message: 'A valid flatId is required' })
      const targetFlat = await Flat.findOne({ _id: flatId, societyId })
      if (!targetFlat) return response.status(400).json({ message: 'Flat not found in this society' })
      const assignmentField = role === 'OWNER' ? 'ownerId' : 'tenantId'
      const occupants = await getFlatOccupants(targetFlat, assignmentField, societyId)
      const confirmedIds = Array.isArray(replaceAssignmentOf)
        ? replaceAssignmentOf.map(String)
        : replaceAssignmentOf ? [String(replaceAssignmentOf)] : []
      if (occupants.some((occupant) => !confirmedIds.includes(occupant._id.toString()))) {
        return sendAssignmentError(response, await assignmentConflict(targetFlat, assignmentField, societyId))
      }
    }

    const resident = await User.create({
  name,
  email,
  phone,
  role,
  societyId,
  password: await bcrypt.hash(password, 12),
  mustChangePassword: true
})
    if (flatId !== undefined) {
      const assignmentError = await assignResidentToFlat(resident, flatId, societyId, replaceAssignmentOf)
      if (assignmentError) {
        await User.findByIdAndDelete(resident._id)
        return sendAssignmentError(response, assignmentError)
      }
    }

    await resident.populate({ path: 'flatId', populate: { path: 'wingId' } })
    return response.status(201).json({ resident: safeResident(resident) })
  } catch (error) {
    return next(error)
  }
}

async function listResidents(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    const filter = { societyId, role: { $in: residentRoles } }
    if (request.query.role) {
      if (!residentRoles.includes(request.query.role)) return response.status(400).json({ message: 'Invalid resident role' })
      filter.role = request.query.role
    }
    if (request.query.search) {
      const search = new RegExp(escapeRegex(request.query.search.trim()), 'i')
      filter.$or = [{ name: search }, { email: search }, { phone: search }]
    }
    if (request.query.wingId) {
      if (!isValidId(request.query.wingId) || !(await Wing.exists({ _id: request.query.wingId, societyId }))) return response.status(400).json({ message: 'Wing not found in this society' })
      const flats = await Flat.find({ societyId, wingId: request.query.wingId }).select('_id')
      filter.flatId = { $in: flats.map((flat) => flat._id) }
    }

    const residents = await User.find(filter).select('-password').populate({ path: 'flatId', populate: [{ path: 'wingId' }, { path: 'parkingIds' }] }).sort({ name: 1 })
    return response.json({ residents })
  } catch (error) {
    return next(error)
  }
}

async function getResident(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    const resident = await getResidentOrNotFound(request.params.id, societyId)
    if (!resident) return response.status(404).json({ message: 'Resident not found' })

    await resident.populate({ path: 'flatId', populate: { path: 'wingId' } })
    return response.json({ resident })
  } catch (error) {
    return next(error)
  }
}

async function updateResident(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    const resident = await getResidentOrNotFound(request.params.id, societyId)
    if (!resident) return response.status(404).json({ message: 'Resident not found' })

    const data = pickFields(request.body, ['name', 'phone', 'email', 'isActive'])
    if (data.email) data.email = data.email.toLowerCase()
    Object.assign(resident, data)

    if (Object.prototype.hasOwnProperty.call(request.body, 'flatId')) {
      const assignmentError = await assignResidentToFlat(resident, request.body.flatId, societyId, request.body.replaceAssignmentOf)
      if (assignmentError) return sendAssignmentError(response, assignmentError)
    } else {
      await resident.save()
    }

    await resident.populate({ path: 'flatId', populate: { path: 'wingId' } })
    return response.json({ resident })
  } catch (error) {
    return next(error)
  }
}

async function removeAssignment(request, response, next) {
  request.body = { flatId: null }
  return updateResident(request, response, next)
}

module.exports = { createResident, listResidents, getResident, updateResident, removeAssignment }
