const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'MaintenanceBill', required: true, unique: true },
    residentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['MOCK', 'RAZORPAY'], default: 'RAZORPAY' },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED'], default: 'PENDING' },
    transactionId: { type: String, required: true, unique: true },
    gatewayOrderId: { type: String, sparse: true, unique: true },
    gatewayPaymentId: { type: String, sparse: true, unique: true },
    paidAt: { type: Date },
  },
  { timestamps: true },
)

module.exports = mongoose.model('Payment', paymentSchema)
