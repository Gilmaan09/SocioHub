const Society = require('../models/Society')
const User = require('../models/User')
const { getAdminSocietyId, isValidId, pickFields } = require('../utils/structureControllerUtils')

async function createSociety(request, response, next) {
  try {
    if (request.user.societyId) {
      return response.status(409).json({ message: 'Admin is already assigned to a society' })
    }

    const data = pickFields(request.body, ['name', 'address', 'totalWings', 'totalFlats', 'contactEmail', 'contactPhone', 'about', 'establishedAt', 'amenities', 'externalAmenities', 'internalFeatures', 'sampleFlatPhotos'])
    const society = await Society.create(data)

    await User.findByIdAndUpdate(request.user._id, { societyId: society._id })
    request.user.societyId = society._id

    return response.status(201).json({ society })
  } catch (error) {
    return next(error)
  }
}

async function getSociety(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    if (!isValidId(request.params.id) || request.params.id !== societyId.toString()) {
      return response.status(404).json({ message: 'Society not found' })
    }

    const society = await Society.findOne({ _id: societyId })
    if (!society) return response.status(404).json({ message: 'Society not found' })

    return response.json({ society })
  } catch (error) {
    return next(error)
  }
}

async function getMySociety(request, response, next) {
  try {
    const societyId = request.user.societyId

    if (!societyId) {
      return response.status(404).json({
        message: 'Watchman is not assigned to a society'
      })
    }

    const society = await Society.findById(societyId)

    if (!society) {
      return response.status(404).json({
        message: 'Society not found'
      })
    }

    return response.json({ society })
  } catch (error) {
    return next(error)
  }
}

async function updateSociety(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    if (!isValidId(request.params.id) || request.params.id !== societyId.toString()) {
      return response.status(404).json({ message: 'Society not found' })
    }

    const data = pickFields(request.body, ['name', 'address', 'totalWings', 'totalFlats', 'contactEmail', 'contactPhone', 'about', 'establishedAt', 'amenities', 'externalAmenities', 'internalFeatures', 'sampleFlatPhotos'])
    const society = await Society.findOneAndUpdate({ _id: societyId }, data, { new: true, runValidators: true })
    if (!society) return response.status(404).json({ message: 'Society not found' })

    return response.json({ society })
  } catch (error) {
    return next(error)
  }
}

module.exports = {
  createSociety,
  getSociety,
  getMySociety,
  updateSociety
}
