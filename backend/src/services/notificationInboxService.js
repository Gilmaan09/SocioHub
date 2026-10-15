const Notification = require('../models/Notification')

async function listForRecipient(recipientId, { unreadOnly = false, limit = 30 } = {}) {
  const filter = { recipientId }
  if (unreadOnly) filter.readAt = null
  return Notification.find(filter).sort({ createdAt: -1 }).limit(limit)
}

async function countUnread(recipientId) {
  return Notification.countDocuments({ recipientId, readAt: null })
}

async function markRead(recipientId, notificationId) {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipientId },
    { $set: { readAt: new Date() } },
    { returnDocument: 'after' },
  )
}

async function markAllRead(recipientId) {
  const result = await Notification.updateMany(
    { recipientId, readAt: null },
    { $set: { readAt: new Date() } },
  )
  return result.modifiedCount
}

module.exports = { listForRecipient, countUnread, markRead, markAllRead }
