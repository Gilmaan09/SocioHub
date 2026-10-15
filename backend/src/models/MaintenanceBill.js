const mongoose = require('mongoose')

const maintenanceBillSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    flatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Flat', required: true, index: true },
    billingPeriod: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    maintenanceAmount: { type: Number, required: true, min: 0 },
    fineAmount: { type: Number, default: 0, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['UNPAID', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'UNPAID', index: true },
    notes: { type: String, trim: true, maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

maintenanceBillSchema.index({ societyId: 1, flatId: 1, billingPeriod: 1 }, { unique: true })

module.exports = mongoose.model('MaintenanceBill', maintenanceBillSchema)