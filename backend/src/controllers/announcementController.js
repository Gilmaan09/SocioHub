const { getAdminSocietyId, isValidId, pickFields } = require('../utils/structureControllerUtils')
const { announcementFields, createAnnouncement, deleteAnnouncement, findAdminAnnouncement, findResidentAnnouncement, listAdminAnnouncements, listResidentAnnouncements, updateAnnouncement } = require('../services/announcementService')

async function create(request, response, next) {
  try {
    const { title, description, priority, attachmentUrl, publishAt, wingId } = request.body
    if (!title || !description) return response.status(400).json({ message: 'Title and description are required' })
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    const result = await createAnnouncement({ societyId, createdBy: request.user._id, data: { title, description, priority, attachmentUrl, publishAt, wingId } })
    if (result.error) return response.status(400).json({ message: result.error })
    return response.status(201).json(result)
  } catch (error) { return next(error) }
}

async function getAll(request, response, next) {
  try { const societyId = getAdminSocietyId(request, response); if (!societyId) return undefined; return response.json({ announcements: await listAdminAnnouncements(societyId) }) } catch (error) { return next(error) }
}

async function getOne(request, response, next) {
  try { const societyId = getAdminSocietyId(request, response); if (!societyId || !isValidId(request.params.id)) return response.status(404).json({ message: 'Announcement not found' }); const announcement = await findAdminAnnouncement(societyId, request.params.id); if (!announcement) return response.status(404).json({ message: 'Announcement not found' }); return response.json({ announcement }) } catch (error) { return next(error) }
}

async function update(request, response, next) {
  try { const societyId = getAdminSocietyId(request, response); if (!societyId || !isValidId(request.params.id)) return response.status(404).json({ message: 'Announcement not found' }); const result = await updateAnnouncement(societyId, request.params.id, pickFields(request.body, announcementFields)); if (result.error) return response.status(400).json({ message: result.error }); if (result.notFound) return response.status(404).json({ message: 'Announcement not found' }); return response.json(result) } catch (error) { return next(error) }
}

async function remove(request, response, next) {
  try { const societyId = getAdminSocietyId(request, response); if (!societyId || !isValidId(request.params.id)) return response.status(404).json({ message: 'Announcement not found' }); const announcement = await deleteAnnouncement(societyId, request.params.id); if (!announcement) return response.status(404).json({ message: 'Announcement not found' }); return response.json({ message: 'Announcement deleted successfully' }) } catch (error) { return next(error) }
}

async function getMine(request, response, next) {
  try { return response.json({ announcements: await listResidentAnnouncements(request.user) }) } catch (error) { return next(error) }
}

async function getMineOne(request, response, next) {
  try { if (!isValidId(request.params.id)) return response.status(404).json({ message: 'Announcement not found' }); const announcement = await findResidentAnnouncement(request.user, request.params.id); if (!announcement) return response.status(404).json({ message: 'Announcement not found' }); return response.json({ announcement }) } catch (error) { return next(error) }
}

module.exports = { create, getAll, getOne, update, remove, getMine, getMineOne }
