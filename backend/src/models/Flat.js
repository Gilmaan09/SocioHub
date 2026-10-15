const mongoose = require('mongoose')

const flatSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    wingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wing', required: true, index: true },
    number: { type: String, required: true, trim: true, maxlength: 30 },
    floor: { type: Number, required: true, min: 0 },
    type: { type: String, trim: true, maxlength: 30 },
    area: { type: Number, min: 0 },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    parkingIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Parking' }],
  },
  { timestamps: true },
)

flatSchema.index({ societyId: 1, wingId: 1, number: 1 }, { unique: true })

module.exports = mongoose.model('Flat', flatSchema)