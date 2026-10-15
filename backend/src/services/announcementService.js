const Announcement = require('../models/Announcement')
const Flat = require('../models/Flat')
const Wing = require('../models/Wing')
const { notifyAnnouncementAudience } = require('./notificationService')

const announcementFields = ['title', 'description', 'priority', 'attachmentUrl', 'publishAt', 'wingId']
const populateAnnouncement = (query) => query.populate('createdBy wingId').sort({ publishAt: -1, createdAt: -1 })

async function validateAudience(societyId, wingId) {
  if (!wingId) return true
  return Wing.exists({ _id: wingId, societyId })
}

async function createAnnouncement({ societyId, createdBy, data }) {
  if (!(await validateAudience(societyId, data.wingId))) return { error: 'Wing not found in this society' }
  const announcement = await Announcement.create({ ...data, societyId, createdBy, wingId: data.wingId || null })
  if (announcement.publishAt <= new Date()) await notifyAnnouncementAudience(announcement)
  return { announcement: await populateAnnouncement(Announcement.findById(announcement._id)) }
}

async function listAdminAnnouncements(societyId) {
  return populateAnnouncement(Announcement.find({ societyId }))
}

async function findAdminAnnouncement(societyId, id) {
  return populateAnnouncement(Announcement.findOne({ _id: id, societyId }))
}

async function updateAnnouncement(societyId, id, data) {
  if (!(await validateAudience(societyId, data.wingId))) return { error: 'Wing not found in this society' }
  const announcement = await Announcement.findOneAndUpdate({ _id: id, societyId }, { ...data, wingId: data.wingId || null }, { new: true, runValidators: true })
  if (!announcement) return { notFound: true }
  if (announcement.publishAt <= new Date()) await notifyAnnouncementAudience(announcement)
  return { announcement: await populateAnnouncement(Announcement.findById(announcement._id)) }
}

async function deleteAnnouncement(societyId, id) {
  return Announcement.findOneAndDelete({ _id: id, societyId })
}

async function listResidentAnnouncements(user) {
  if (!user.societyId) return []
  const now = new Date()
  let wingId = null
  if (user.flatId) {
    const flat = await Flat.findOne({ _id: user.flatId, societyId: user.societyId }).select('wingId')
    wingId = flat?.wingId || null
  }
  return populateAnnouncement(Announcement.find({ societyId: user.societyId, publishAt: { $lte: now }, $or: [{ wingId: null }, ...(wingId ? [{ wingId }] : [])] }))
}

async function findResidentAnnouncement(user, id) {
  const announcements = await listResidentAnnouncements(user)
  return announcements.find((announcement) => announcement._id.toString() === id) || null
}

module.exports = { announcementFields, createAnnouncement, listAdminAnnouncements, findAdminAnnouncement, updateAnnouncement, deleteAnnouncement, listResidentAnnouncements, findResidentAnnouncement }
