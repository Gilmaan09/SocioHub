const mongoose = require('mongoose')
const { countUnread, listForRecipient, markAllRead, markRead } = require('../services/notificationInboxService')

async function getMine(request, response, next) {
  try {
    const unreadOnly = request.query.unreadOnly === 'true'
    const limitValue = Number(request.query.limit || 30)
    const limit = Number.isFinite(limitValue) ? Math.max(1, Math.min(limitValue, 100)) : 30
    const [notifications, unreadCount] = await Promise.all([
      listForRecipient(request.user._id, { unreadOnly, limit }),
      countUnread(request.user._id),
    ])
    return response.json({ notifications, unreadCount })
  } catch (error) { return next(error) }
}

async function getUnreadCount(request, response, next) {
  try { return response.json({ unreadCount: await countUnread(request.user._id) }) } catch (error) { return next(error) }
}

async function readOne(request, response, next) {
  try {
    if (!mongoose.isValidObjectId(request.params.id)) return response.status(404).json({ message: 'Notification not found' })
    const notification = await markRead(request.user._id, request.params.id)
    if (!notification) return response.status(404).json({ message: 'Notification not found' })
    return response.json({ notification })
  } catch (error) { return next(error) }
}

async function readAll(request, response, next) {
  try { return response.json({ markedRead: await markAllRead(request.user._id) }) } catch (error) { return next(error) }
}

module.exports = { getMine, getUnreadCount, readOne, readAll }
