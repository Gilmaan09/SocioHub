const mongoose = require('mongoose')

const parkingSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    slotNumber: { type: String, required: true, trim: true, maxlength: 30 },
    type: { type: String, enum: ['CAR', 'BIKE', 'OTHER'], required: true },
    status: { type: String, enum: ['AVAILABLE', 'ASSIGNED', 'MAINTENANCE'], default: 'AVAILABLE' },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat' },
    notes: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true },
)

parkingSchema.index({ societyId: 1, slotNumber: 1 }, { unique: true })

module.exports = mongoose.model('Parking', parkingSchema)