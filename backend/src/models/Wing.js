const mongoose = require('mongoose')

const wingSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 50 },
    totalFloors: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true },
)

wingSchema.index({ societyId: 1, name: 1 }, { unique: true })

module.exports = mongoose.model('Wing', wingSchema)