const FinanceTransaction = require('../models/FinanceTransaction')

const incomeCategories = ['OTHER_INCOME', 'DONATION', 'INTEREST', 'PARKING', 'FINE']
const expenseCategories = ['SECURITY_SALARY', 'CLEANING', 'REPAIRS', 'COMMON_AREA', 'UTILITIES', 'OTHER_EXPENSE']

async function setOpeningBalance({ societyId, createdBy, amount, transactionDate, description }) {
  const existing = await FinanceTransaction.exists({ societyId, type: 'OPENING_BALANCE' })
  if (existing) return { error: 'Opening balance has already been recorded for this society' }

  const transaction = await FinanceTransaction.create({
    societyId,
    createdBy,
    type: 'OPENING_BALANCE',
    category: 'OPENING_BALANCE',
    amount,
    transactionDate: transactionDate || new Date(),
    description,
  })
  return { transaction }
}

async function recordTransaction({ societyId, createdBy, data }) {
  const validCategories = data.type === 'INCOME' ? incomeCategories : expenseCategories
  if (!['INCOME', 'EXPENSE'].includes(data.type)) return { error: 'Transaction type must be INCOME or EXPENSE' }
  if (!validCategories.includes(data.category)) return { error: 'Category does not match the transaction type' }
  if (!Number.isFinite(Number(data.amount)) || Number(data.amount) <= 0) return { error: 'Amount must be greater than zero' }

  const transaction = await FinanceTransaction.create({
    societyId,
    createdBy,
    type: data.type,
    category: data.category,
    amount: Number(data.amount),
    description: data.description,
    transactionDate: data.transactionDate || new Date(),
    receiptUrl: data.receiptUrl,
  })
  return { transaction }
}

async function recordMaintenancePayment({ payment, bill, resident }) {
  if (payment.status !== 'SUCCESS') return { error: 'Only successful payments can be posted to society income' }

  const flat = bill.flatId?.number
    ? bill.flatId
    : await bill.populate({ path: 'flatId', populate: { path: 'wingId' } }).then((populatedBill) => populatedBill.flatId)
  const flatLabel = flat ? `${flat.wingId?.name ? `Wing ${flat.wingId.name} ` : ''}${flat.number}` : 'resident flat'

  try {
    const transaction = await FinanceTransaction.findOneAndUpdate(
      { paymentId: payment._id },
      {
        $setOnInsert: {
          societyId: payment.societyId,
          paymentId: payment._id,
          type: 'INCOME',
          category: 'MAINTENANCE',
          amount: payment.amount,
          description: `Maintenance ${bill.billingPeriod} payment for ${flatLabel}`,
          transactionDate: payment.paidAt || new Date(),
          createdBy: resident._id,
        },
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true },
    )
    return { transaction }
  } catch (error) {
    if (error.code !== 11000) throw error
    return { transaction: await FinanceTransaction.findOne({ paymentId: payment._id }) }
  }
}

async function listTransactions(societyId, query = {}) {
  const filter = { societyId }
  if (query.type && ['INCOME', 'EXPENSE', 'OPENING_BALANCE'].includes(query.type)) filter.type = query.type
  if (query.category) filter.category = query.category
  if (query.from || query.to) {
    filter.transactionDate = {}
    if (query.from) filter.transactionDate.$gte = new Date(query.from)
    if (query.to) filter.transactionDate.$lte = new Date(query.to)
  }

  return FinanceTransaction.find(filter)
    .populate('createdBy', 'name email')
    .sort({ transactionDate: -1, createdAt: -1 })
}

async function getFundSummary(societyId) {
  const [openingEntry, totals] = await Promise.all([
    FinanceTransaction.findOne({ societyId, type: 'OPENING_BALANCE' }).select('amount transactionDate'),
    FinanceTransaction.aggregate([
      { $match: { societyId } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
  ])

  const amounts = Object.fromEntries(totals.map((entry) => [entry._id, entry.total]))
  const openingBalance = openingEntry?.amount || 0
  const totalIncome = amounts.INCOME || 0
  const totalExpenses = amounts.EXPENSE || 0

  return {
    openingBalance,
    totalIncome,
    totalExpenses,
    currentBalance: openingBalance + totalIncome - totalExpenses,
    transactionCount: totals.reduce((sum, entry) => sum + entry.count, 0),
    openingBalanceSet: Boolean(openingEntry),
  }
}

module.exports = { setOpeningBalance, recordTransaction, recordMaintenancePayment, listTransactions, getFundSummary }
