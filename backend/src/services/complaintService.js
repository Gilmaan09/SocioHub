const Complaint = require('../models/Complaint')
const Flat = require('../models/Flat')
const { notifySocietyAdmins, notifyUsers } = require('./notificationService')

function complaintNumber() {
  return `CMP-${Date.now().toString().slice(-8)}`
}

const populateComplaint = (query) => query.populate('residentId assignedTo').populate({ path: 'flatId', populate: { path: 'wingId' } })

async function createComplaint(user, data) {
  if (!user.flatId || !user.societyId) return { error: 'Your account is not assigned to a society flat' }
  const flat = await Flat.exists({ _id: user.flatId, societyId: user.societyId })
  if (!flat) return { error: 'Your assigned flat was not found' }

  const complaint = await Complaint.create({ ...data, societyId: user.societyId, flatId: user.flatId, residentId: user._id, complaintNumber: complaintNumber() })
  await notifySocietyAdmins(user.societyId, {
    societyId: user.societyId,
    type: 'NEW_COMPLAINT',
    title: 'New resident complaint',
    message: `${complaint.complaintNumber}: ${complaint.title}`,
    href: `/admin/complaints/${complaint._id}`,
    entityType: 'COMPLAINT',
    entityId: complaint._id,
    eventKey: `new-complaint:${complaint._id}`,
  })
  await notifyUsers([user._id], {
    societyId: user.societyId,
    type: 'COMPLAINT_RECEIVED',
    title: 'Complaint submitted',
    message: `${complaint.complaintNumber} was submitted and is awaiting review.`,
    href: `/resident/complaints/${complaint._id}`,
    entityType: 'COMPLAINT',
    entityId: complaint._id,
    eventKey: `complaint-received:${complaint._id}`,
  })
  return { complaint: await populateComplaint(Complaint.findById(complaint._id)) }
}

async function listResidentComplaints(user) {
  return populateComplaint(Complaint.find({ societyId: user.societyId, residentId: user._id }).sort({ createdAt: -1 }))
}

async function findResidentComplaint(user, id) {
  return populateComplaint(Complaint.findOne({ _id: id, societyId: user.societyId, residentId: user._id }))
}

async function listAdminComplaints(societyId, query = {}) {
  const filter = { societyId }
  if (query.status) filter.status = query.status
  if (query.priority) filter.priority = query.priority
  return populateComplaint(Complaint.find(filter).sort({ createdAt: -1 }))
}

async function updateAdminComplaint(societyId, id, data) {
  const complaint = await Complaint.findOne({ _id: id, societyId })
  if (!complaint) return null
  const changedFields = ['priority', 'status', 'assignedTo', 'adminResponse'].filter((field) => {
    if (data[field] === undefined) return false
    const before = complaint[field]?.toString?.() ?? complaint[field] ?? ''
    const after = data[field]?.toString?.() ?? data[field] ?? ''
    return before !== after
  })
  Object.assign(complaint, data)
  if (data.status === 'RESOLVED') complaint.resolvedAt = new Date()
  await complaint.save()

  if (changedFields.length > 0) {
    const statusText = complaint.status.replaceAll('_', ' ').toLowerCase()
    await notifyUsers([complaint.residentId], {
      societyId: complaint.societyId,
      type: 'COMPLAINT_UPDATE',
      title: `Complaint ${statusText}`,
      message: complaint.adminResponse || `${complaint.complaintNumber} was updated by the society team.`,
      href: `/resident/complaints/${complaint._id}`,
      entityType: 'COMPLAINT',
      entityId: complaint._id,
      eventKey: `complaint-update:${complaint._id}:${complaint.updatedAt.getTime()}`,
    })
  }

  return populateComplaint(Complaint.findById(complaint._id))
}

async function deleteAdminComplaint(societyId, id) {
  return Complaint.findOneAndDelete({ _id: id, societyId })
}

module.exports = { createComplaint, listResidentComplaints, findResidentComplaint, listAdminComplaints, updateAdminComplaint, deleteAdminComplaint }
