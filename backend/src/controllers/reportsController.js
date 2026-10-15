const MaintenanceBill = require('../models/MaintenanceBill')
const Payment = require('../models/Payment')
const FinanceTransaction = require('../models/FinanceTransaction')
const Complaint = require('../models/Complaint')
const WatchmanAttendance = require('../models/WatchmanAttendance')
const { getAdminSocietyId } = require('../utils/structureControllerUtils')

function dayAfter(value) {
  const date = new Date(`${value}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date
}

function validDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(new Date(`${value}T00:00:00.000Z`).getTime())
}

async function getReports(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    const today = new Date().toISOString().slice(0, 10)
    const from = request.query.from || `${today.slice(0, 8)}01`
    const to = request.query.to || today
    if (!validDate(from) || !validDate(to) || from > to) {
      return response.status(400).json({ message: 'Choose a valid date range' })
    }

    const start = new Date(`${from}T00:00:00.000Z`)
    const end = dayAfter(to)
    const dateRange = { $gte: start, $lt: end }
    const billRange = { $gte: from.slice(0, 7), $lte: to.slice(0, 7) }
    const society = { societyId }

    const [bills, payments, transactions, complaints, attendance] = await Promise.all([
      MaintenanceBill.find({ ...society, billingPeriod: billRange })
        .populate({ path: 'flatId', select: 'number wingId', populate: { path: 'wingId', select: 'name' } })
        .sort({ billingPeriod: -1, createdAt: -1 }).lean(),
      Payment.find({ ...society, status: 'SUCCESS', paidAt: dateRange })
        .populate({ path: 'billId', select: 'billingPeriod flatId', populate: { path: 'flatId', select: 'number wingId', populate: { path: 'wingId', select: 'name' } } })
        .populate('residentId', 'name').sort({ paidAt: -1 }).lean(),
      FinanceTransaction.find({ ...society, transactionDate: dateRange }).sort({ transactionDate: -1 }).lean(),
      Complaint.find({ ...society, createdAt: dateRange }).populate('flatId', 'number wingId').populate('residentId', 'name').sort({ createdAt: -1 }).lean(),
      WatchmanAttendance.find({ ...society, dutyStart: dateRange }).populate('watchmanId', 'name').sort({ dutyStart: -1 }).lean(),
    ])

    const pendingBills = bills.filter((bill) => ['UNPAID', 'OVERDUE'].includes(bill.status))
    return response.json({
      range: { from, to },
      maintenance: {
        billed: bills.reduce((sum, bill) => sum + bill.totalAmount, 0),
        collected: payments.reduce((sum, payment) => sum + payment.amount, 0),
        pending: pendingBills.reduce((sum, bill) => sum + bill.totalAmount, 0),
        bills,
        payments,
      },
      finance: {
        income: transactions.filter((item) => item.type === 'INCOME').reduce((sum, item) => sum + item.amount, 0),
        expenses: transactions.filter((item) => item.type === 'EXPENSE').reduce((sum, item) => sum + item.amount, 0),
        transactions,
      },
      complaints: {
        total: complaints.length,
        open: complaints.filter((item) => !['RESOLVED', 'CLOSED'].includes(item.status)).length,
        items: complaints,
      },
      attendance: {
        shifts: attendance.length,
        completed: attendance.filter((item) => item.status === 'COMPLETED').length,
        items: attendance,
      },
    })
  } catch (error) { return next(error) }
}

module.exports = { getReports }
