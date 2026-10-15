const Flat = require('../models/Flat')
const User = require('../models/User')
const Wing = require('../models/Wing')
const Parking = require('../models/Parking')
const { getAdminSocietyId, isValidId, pickFields } = require('../utils/structureControllerUtils')

async function getMyFlat(request, response, next) {
  try {
    if (!request.user.flatId) return response.status(404).json({ message: 'No flat is assigned to this account' })

    const flat = await Flat.findOne({ _id: request.user.flatId, societyId: request.user.societyId })
      .populate('wingId parkingIds ownerId tenantId')

    if (!flat) return response.status(404).json({ message: 'Assigned flat was not found' })

    return response.json({ flat })
  } catch (error) {
    return next(error)
  }
}

async function findAssignableUser(userId, role, societyId) {
  if (!userId) return null
  if (!isValidId(userId)) return undefined
  return User.findOne({ _id: userId, role, $or: [{ societyId }, { societyId: { $exists: false } }, { societyId: null }] })
}

async function validateParkingIds(parkingIds, societyId) {
  if (parkingIds === undefined) return true
  if (!Array.isArray(parkingIds) || parkingIds.some((id) => !isValidId(id))) return false
  const count = await Parking.countDocuments({ _id: { $in: parkingIds }, societyId, status: { $ne: 'MAINTENANCE' } })
  return count === parkingIds.length
}

async function applyAssignments(flat, data, societyId) {
  if (data.ownerId !== undefined) {
    const owner = await findAssignableUser(data.ownerId, 'OWNER', societyId)
    if (!owner) return 'Owner not found in this society'
    await User.findByIdAndUpdate(owner._id, { societyId, flatId: flat._id })
  }

  if (data.tenantId !== undefined && data.tenantId !== null) {
    const tenant = await findAssignableUser(data.tenantId, 'TENANT', societyId)
    if (!tenant) return 'Tenant not found in this society'
    await User.findByIdAndUpdate(tenant._id, { societyId, flatId: flat._id })
  }

  if (data.parkingIds !== undefined) {
    await Parking.updateMany({ flatId: flat._id }, { $unset: { flatId: 1 }, $set: { status: 'AVAILABLE' } })
    await Parking.updateMany({ _id: { $in: data.parkingIds }, societyId }, { $set: { flatId: flat._id, status: 'ASSIGNED' } })
  }

  return null
}

async function createFlat(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    const { wingId, ownerId, tenantId, parkingIds } = request.body
    if (!isValidId(wingId)) return response.status(400).json({ message: 'A valid wingId is required' })
    const wing = await Wing.findOne({ _id: wingId, societyId })
    if (!wing) return response.status(400).json({ message: 'Wing does not belong to this society' })
    if (!(await validateParkingIds(parkingIds, societyId))) return response.status(400).json({ message: 'One or more parking slots are invalid or unavailable' })

    const data = pickFields(request.body, ['number', 'floor', 'type', 'area', 'ownerId', 'tenantId', 'parkingIds'])
    const flat = await Flat.create({ ...data, societyId, wingId })
    const assignmentError = await applyAssignments(flat, { ownerId, tenantId, parkingIds }, societyId)
    if (assignmentError) {
      await Flat.findByIdAndDelete(flat._id)
      return response.status(400).json({ message: assignmentError })
    }

    return response.status(201).json({ flat: await Flat.findById(flat._id).populate('wingId ownerId tenantId parkingIds') })
  } catch (error) {
    return next(error)
  }
}

async function getFlats(request, response, next) {
  try {
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(400).json({
        message: 'User is not assigned to a society',
      })
    }

    const filter = { societyId }

    if (
      request.query.wingId &&
      isValidId(request.query.wingId)
    ) {
      filter.wingId = request.query.wingId
    }

    const residentProjection = request.user.role === 'WATCHMAN' ? 'name role' : undefined
    const flats = await Flat.find(filter)
      .populate('wingId')
      .populate({ path: 'ownerId', ...(residentProjection ? { select: residentProjection } : {}) })
      .populate({ path: 'tenantId', ...(residentProjection ? { select: residentProjection } : {}) })
      .populate('parkingIds')
      .sort({
        wingId: 1,
        floor: 1,
        number: 1,
      })

    return response.json({ flats })
  } catch (error) {
    return next(error)
  }
}

async function updateFlat(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    if (!isValidId(request.params.id)) return response.status(404).json({ message: 'Flat not found' })

    const flat = await Flat.findOne({ _id: request.params.id, societyId })
    if (!flat) return response.status(404).json({ message: 'Flat not found' })

    const { wingId, ownerId, tenantId, parkingIds } = request.body
    if (wingId !== undefined) {
      if (!isValidId(wingId) || !(await Wing.exists({ _id: wingId, societyId }))) return response.status(400).json({ message: 'Wing does not belong to this society' })
    }
    if (!(await validateParkingIds(parkingIds, societyId))) return response.status(400).json({ message: 'One or more parking slots are invalid or unavailable' })

    const data = pickFields(request.body, ['wingId', 'number', 'floor', 'type', 'area', 'ownerId', 'tenantId', 'parkingIds'])
    Object.assign(flat, data)
    await flat.save()
    const assignmentError = await applyAssignments(flat, { ownerId, tenantId, parkingIds }, societyId)
    if (assignmentError) return response.status(400).json({ message: assignmentError })

    return response.json({ flat: await Flat.findById(flat._id).populate('wingId ownerId tenantId parkingIds') })
  } catch (error) {
    return next(error)
  }
}

async function deleteFlat(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    if (!isValidId(request.params.id)) return response.status(404).json({ message: 'Flat not found' })

    const flat = await Flat.findOneAndDelete({ _id: request.params.id, societyId })
    if (!flat) return response.status(404).json({ message: 'Flat not found' })
    await Parking.updateMany({ flatId: flat._id }, { $unset: { flatId: 1 }, $set: { status: 'AVAILABLE' } })

    return response.json({ message: 'Flat deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

module.exports = { createFlat, getFlats, updateFlat, deleteFlat, getMyFlat }
