const Notification = require('../models/Notification')
const User = require('../models/User')
const Flat = require('../models/Flat')
const Wing = require('../models/Wing')

async function bestEffortNotification(work) {
  try {
    await work()
  } catch (error) {
    console.error('Could not deliver notification:', error.message)
  }
}

async function createForUser(recipientId, data) {
  if (!recipientId) return
  try {
    await Notification.updateOne(
      { recipientId, eventKey: data.eventKey },
      {
        $setOnInsert: {
          ...data,
          recipientId,
          readAt: null,
        },
      },
      { upsert: true, setDefaultsOnInsert: true },
    )
  } catch (error) {
    if (error.code !== 11000) console.error('Could not save notification:', error.message)
  }
}

async function notifyUsers(recipientIds, data) {
  const uniqueIds = [...new Set(recipientIds.filter(Boolean).map((id) => id.toString()))]
  await Promise.all(uniqueIds.map((recipientId) => createForUser(recipientId, data)))
}

async function notifyFlatResidents(societyId, flatId, data) {
  await bestEffortNotification(async () => {
    const flat = await Flat.findOne({ _id: flatId, societyId }).select('ownerId tenantId')
    if (flat) await notifyUsers([flat.ownerId, flat.tenantId], data)
  })
}

async function notifySocietyAdmins(societyId, data) {
  await bestEffortNotification(async () => {
    const admins = await User.find({ societyId, role: 'ADMIN', isActive: true }).select('_id')
    await notifyUsers(admins.map((admin) => admin._id), data)
  })
}

async function notifyWatchman(watchmanId, data) {
  if (!watchmanId) return
  await bestEffortNotification(async () => {
    const watchman = await User.findOne({ _id: watchmanId, role: 'WATCHMAN', isActive: true }).select('_id')
    if (watchman) await notifyUsers([watchman._id], data)
  })
}

async function notifyAnnouncementAudience(announcement) {
  await bestEffortNotification(async () => {
    let users
    if (announcement.wingId) {
      const wing = await Wing.findOne({ _id: announcement.wingId, societyId: announcement.societyId }).select('_id')
      if (!wing) return
      const flats = await Flat.find({ societyId: announcement.societyId, wingId: wing._id }).select('_id')
      users = await User.find({ societyId: announcement.societyId, role: { $in: ['OWNER', 'TENANT'] }, flatId: { $in: flats.map((flat) => flat._id) }, isActive: true }).select('_id')
    } else {
      users = await User.find({ societyId: announcement.societyId, role: { $in: ['OWNER', 'TENANT'] }, isActive: true }).select('_id')
    }

    await notifyUsers(users.map((user) => user._id), {
      societyId: announcement.societyId,
      type: 'ANNOUNCEMENT',
      title: announcement.priority === 'IMPORTANT' ? 'Important society announcement' : 'New society announcement',
      message: announcement.title,
      href: `/resident/announcements/${announcement._id}`,
      entityType: 'ANNOUNCEMENT',
      entityId: announcement._id,
      eventKey: `announcement:${announcement._id}`,
    })
  })
}

async function notifyCommunityPost(post) {
  await bestEffortNotification(async () => {
    let residents
    if (post.scope === 'WING' && post.wingId) {
      const flats = await Flat.find({ societyId: post.societyId, wingId: post.wingId }).select('_id')
      residents = await User.find({ societyId: post.societyId, role: { $in: ['OWNER', 'TENANT'] }, flatId: { $in: flats.map((flat) => flat._id) }, isActive: true }).select('_id')
    } else {
      residents = await User.find({ societyId: post.societyId, role: { $in: ['OWNER', 'TENANT'] }, isActive: true }).select('_id')
    }

    await notifyUsers(residents.map((resident) => resident._id).filter((id) => id.toString() !== post.authorId.toString()), {
      societyId: post.societyId,
      type: 'COMMUNITY_POST',
      title: post.scope === 'WING' ? 'New post in your wing' : 'New community post',
      message: post.title,
      href: '/resident/community',
      entityType: 'COMMUNITY_POST',
      entityId: post._id,
      eventKey: `community-post:${post._id}`,
    })
  })
}

async function notifyCommunityComment(post, comment) {
  if (post.authorId.toString() === comment.authorId.toString()) return
  await createForUser(post.authorId, {
    societyId: post.societyId,
    type: 'COMMUNITY_COMMENT',
    title: 'New reply to your community post',
    message: comment.content,
    href: '/resident/community',
    entityType: 'COMMUNITY_POST',
    entityId: post._id,
    eventKey: `community-comment:${comment._id}`,
  })
}

module.exports = { createForUser, notifyUsers, notifyFlatResidents, notifySocietyAdmins, notifyWatchman, notifyAnnouncementAudience, notifyCommunityPost, notifyCommunityComment }
