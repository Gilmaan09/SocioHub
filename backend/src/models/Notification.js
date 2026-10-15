const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema(
  {
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true },
    type: {
      type: String,
      enum: [
        'MAINTENANCE_BILL',
        'PAYMENT_CONFIRMED',
        'PAYMENT_ACTIVITY',
        'NEW_COMPLAINT',
        'COMPLAINT_RECEIVED',
        'COMPLAINT_UPDATE',
        'ANNOUNCEMENT',
        'COMMUNITY_POST',
        'COMMUNITY_COMMENT',
        'VISITOR_REQUEST',
        'VISITOR_DECISION',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    message: { type: String, required: true, trim: true, maxlength: 500 },
    href: { type: String, required: true, trim: true, maxlength: 300 },
    entityType: { type: String, required: true, trim: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    eventKey: { type: String, required: true, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true },
)

notificationSchema.index({ recipientId: 1, eventKey: 1 }, { unique: true })
notificationSchema.index({ recipientId: 1, readAt: 1, createdAt: -1 })
notificationSchema.index({ societyId: 1, createdAt: -1 })

module.exports = mongoose.model('Notification', notificationSchema)
