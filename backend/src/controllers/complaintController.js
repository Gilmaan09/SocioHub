const { getAdminSocietyId, isValidId, pickFields } = require('../utils/structureControllerUtils')
const { createComplaint, deleteAdminComplaint, findResidentComplaint, listAdminComplaints, listResidentComplaints, updateAdminComplaint } = require('../services/complaintService')

async function create(request, response, next) {
  try {
    const { category, title, description, priority, imageUrl } = request.body
    if (!category || !title || !description) return response.status(400).json({ message: 'Category, title, and description are required' })
    const result = await createComplaint(request.user, { category, title, description, priority, imageUrl })
    if (result.error) return response.status(400).json({ message: result.error })
    return response.status(201).json(result)
  } catch (error) { return next(error) }
}

async function getMine(request, response, next) {
  try { return response.json({ complaints: await listResidentComplaints(request.user) }) } catch (error) { return next(error) }
}

async function getMineById(request, response, next) {
  try {
    if (!isValidId(request.params.id)) return response.status(404).json({ message: 'Complaint not found' })
    const complaint = await findResidentComplaint(request.user, request.params.id)
    if (!complaint) return response.status(404).json({ message: 'Complaint not found' })
    return response.json({ complaint })
  } catch (error) { return next(error) }
}

async function getAll(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    return response.json({ complaints: await listAdminComplaints(societyId, request.query) })
  } catch (error) { return next(error) }
}

async function update(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId || !isValidId(request.params.id)) return response.status(404).json({ message: 'Complaint not found' })
    const data = pickFields(request.body, ['priority', 'status', 'assignedTo', 'adminResponse'])
    const complaint = await updateAdminComplaint(societyId, request.params.id, data)
    if (!complaint) return response.status(404).json({ message: 'Complaint not found' })
    return response.json({ complaint })
  } catch (error) { return next(error) }
}

async function remove(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId || !isValidId(request.params.id)) return response.status(404).json({ message: 'Complaint not found' })
    const complaint = await deleteAdminComplaint(societyId, request.params.id)
    if (!complaint) return response.status(404).json({ message: 'Complaint not found' })
    return response.json({ message: 'Complaint deleted successfully' })
  } catch (error) { return next(error) }
}

module.exports = { create, getMine, getMineById, getAll, update, remove }
