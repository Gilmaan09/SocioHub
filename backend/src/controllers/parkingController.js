const Parking = require('../models/Parking')
const Flat = require('../models/Flat')
const { getAdminSocietyId, isValidId, pickFields } = require('../utils/structureControllerUtils')

async function validateFlat(flatId, societyId) {
  if (!flatId) return null
  if (!isValidId(flatId)) return undefined
  return Flat.findOne({ _id: flatId, societyId })
}

async function createParking(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    const { flatId } = request.body
    if (flatId !== undefined && !(await validateFlat(flatId, societyId))) return response.status(400).json({ message: 'Flat does not belong to this society' })

    const data = pickFields(request.body, ['slotNumber', 'type', 'status', 'flatId', 'notes'])
    if (flatId) data.status = 'ASSIGNED'
    const parking = await Parking.create({ ...data, societyId })
    if (flatId) await Flat.findByIdAndUpdate(flatId, { $addToSet: { parkingIds: parking._id } })

    return response.status(201).json({ parking: await parking.populate('flatId') })
  } catch (error) {
    return next(error)
  }
}

async function getParking(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    const parking = await Parking.find({ societyId }).populate('flatId').sort({ slotNumber: 1 })
    return response.json({ parking })
  } catch (error) {
    return next(error)
  }
}

async function updateParking(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    if (!isValidId(request.params.id)) return response.status(404).json({ message: 'Parking slot not found' })

    const parking = await Parking.findOne({ _id: request.params.id, societyId })
    if (!parking) return response.status(404).json({ message: 'Parking slot not found' })

    const { flatId, status } = request.body
    if (flatId !== undefined && flatId !== null && !(await validateFlat(flatId, societyId))) return response.status(400).json({ message: 'Flat does not belong to this society' })
    if (status === 'ASSIGNED' && !flatId && !parking.flatId) return response.status(400).json({ message: 'An assigned parking slot must have a flat' })

    const previousFlatId = parking.flatId
    Object.assign(parking, pickFields(request.body, ['slotNumber', 'type', 'status', 'flatId', 'notes']))
    if (flatId === null) parking.status = 'AVAILABLE'
    if (flatId) parking.status = 'ASSIGNED'
    await parking.save()

    if (previousFlatId && previousFlatId.toString() !== parking.flatId?.toString()) {
      await Flat.findByIdAndUpdate(previousFlatId, { $pull: { parkingIds: parking._id } })
    }
    if (parking.flatId) await Flat.findByIdAndUpdate(parking.flatId, { $addToSet: { parkingIds: parking._id } })

    return response.json({ parking: await parking.populate('flatId') })
  } catch (error) {
    return next(error)
  }
}

async function deleteParking(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    if (!isValidId(request.params.id)) return response.status(404).json({ message: 'Parking slot not found' })

    const parking = await Parking.findOneAndDelete({ _id: request.params.id, societyId })
    if (!parking) return response.status(404).json({ message: 'Parking slot not found' })
    if (parking.flatId) await Flat.findByIdAndUpdate(parking.flatId, { $pull: { parkingIds: parking._id } })

    return response.json({ message: 'Parking slot deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

module.exports = { createParking, getParking, updateParking, deleteParking }
