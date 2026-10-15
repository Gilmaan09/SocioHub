const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaintenanceBill', required: true, unique: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['MOCK', 'RAZORPAY'], default: 'MOCK' },
    status: { type: String, enum: ['SUCCESS', 'FAILED'], default: 'SUCCESS' },
    transactionId: { type: String, required: true, unique: true },
    paidAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Payment', paymentSchema)
