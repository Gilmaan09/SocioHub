const mongoose = require('mongoose')

const announcementSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    wingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wing', default: null, index: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    priority: { type: String, enum: ['NORMAL', 'IMPORTANT'], default: 'NORMAL' },
    attachmentUrl: { type: String, trim: true },
    publishAt: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true },
)

announcementSchema.index({ societyId: 1, publishAt: -1 })

module.exports = mongoose.model('Announcement', announcementSchema)
