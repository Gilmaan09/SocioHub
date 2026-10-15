const mongoose = require('mongoose')

function isValidId(value) {
  return mongoose.isValidObjectId(value)
}

function getAdminSocietyId(request, response) {
  if (!request.user.societyId) {
    response.status(409).json({ message: 'Admin is not assigned to a society yet' })
    return null
  }

  return request.user.societyId
}

function pickFields(source, fields) {
  return fields.reduce((result, field) => {
    if (source[field] !== undefined) {
      result[field] = source[field]
    }
    return result
  }, {})
}

module.exports = { getAdminSocietyId, isValidId, pickFields }
