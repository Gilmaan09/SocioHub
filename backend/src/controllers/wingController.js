const Wing = require('../models/Wing')
const { getAdminSocietyId, isValidId, pickFields } = require('../utils/structureControllerUtils')

async function createWing(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    const data = pickFields(request.body, ['name', 'totalFloors', 'description'])
    const wing = await Wing.create({ ...data, societyId })
    return response.status(201).json({ wing })
  } catch (error) {
    return next(error)
  }
}

async function getWings(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    const wings = await Wing.find({ societyId }).sort({ name: 1 })
    return response.json({ wings })
  } catch (error) {
    return next(error)
  }
}

async function updateWing(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    if (!isValidId(request.params.id)) return response.status(404).json({ message: 'Wing not found' })

    const data = pickFields(request.body, ['name', 'totalFloors', 'description'])
    const wing = await Wing.findOneAndUpdate({ _id: request.params.id, societyId }, data, { new: true, runValidators: true })
    if (!wing) return response.status(404).json({ message: 'Wing not found' })

    return response.json({ wing })
  } catch (error) {
    return next(error)
  }
}

async function deleteWing(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    if (!isValidId(request.params.id)) return response.status(404).json({ message: 'Wing not found' })

    const wing = await Wing.findOneAndDelete({ _id: request.params.id, societyId })
    if (!wing) return response.status(404).json({ message: 'Wing not found' })

    return response.json({ message: 'Wing deleted successfully' })
  } catch (error) {
    return next(error)
  }
}

module.exports = { createWing, getWings, updateWing, deleteWing }
