const mongoose = require('mongoose')

const financeTransactionSchema = new mongoose.Schema(
  {
    societyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Society', required: true, index: true },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    type: { type: String, enum: ['OPENING_BALANCE', 'INCOME', 'EXPENSE'], required: true, index: true },
    category: {
      type: String,
      enum: [
        'OPENING_BALANCE',
        'OTHER_INCOME',
        'DONATION',
        'INTEREST',
        'MAINTENANCE',
        'PARKING',
        'FINE',
        'SECURITY_SALARY',
        'CLEANING',
        'REPAIRS',
        'COMMON_AREA',
        'UTILITIES',
        'OTHER_EXPENSE',
      ],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    transactionDate: { type: Date, required: true, default: Date.now, index: true },
    receiptUrl: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
)

financeTransactionSchema.index(
  { societyId: 1, type: 1 },
  { unique: true, partialFilterExpression: { type: 'OPENING_BALANCE' } },
)
financeTransactionSchema.index({ societyId: 1, transactionDate: -1 })
financeTransactionSchema.index({ paymentId: 1 }, { unique: true, sparse: true })

module.exports = mongoose.model('FinanceTransaction', financeTransactionSchema)
