const Flat = require('../models/Flat')
const MaintenanceBill = require('../models/MaintenanceBill')
const Payment = require('../models/Payment')
const { recordMaintenancePayment } = require('./financeService')
const { notifyFlatResidents, notifySocietyAdmins, notifyUsers } = require('./notificationService')

async function createBill({ societyId, createdBy, data }) {
  const flat = await Flat.findOne({ _id: data.flatId, societyId })
  if (!flat) return { error: 'Flat not found in this society' }

  const maintenanceAmount = Number(data.maintenanceAmount)
  const fineAmount = Number(data.fineAmount || 0)
  if (!Number.isFinite(maintenanceAmount) || maintenanceAmount < 0 || !Number.isFinite(fineAmount) || fineAmount < 0) {
    return { error: 'Maintenance and fine amounts must be valid non-negative numbers' }
  }

  const bill = await MaintenanceBill.create({
    societyId,
    createdBy,
    flatId: data.flatId,
    billingPeriod: data.billingPeriod,
    maintenanceAmount,
    fineAmount,
    totalAmount: maintenanceAmount + fineAmount,
    dueDate: data.dueDate,
    notes: data.notes,
  })

  await notifyFlatResidents(societyId, bill.flatId, {
    societyId,
    type: 'MAINTENANCE_BILL',
    title: 'New maintenance bill',
    message: `${bill.billingPeriod} bill: ₹${bill.totalAmount.toLocaleString('en-IN')}`,
    href: `/resident/maintenance/${bill._id}`,
    entityType: 'MAINTENANCE_BILL',
    entityId: bill._id,
    eventKey: `maintenance-bill:${bill._id}`,
  })

  return { bill: await bill.populate({ path: 'flatId', populate: { path: 'wingId' } }) }
}

async function listAdminBills(societyId, query = {}) {
  const filter = { societyId }
  if (query.billingPeriod) filter.billingPeriod = query.billingPeriod
  if (query.status) filter.status = query.status
  if (query.flatId) filter.flatId = query.flatId
  return MaintenanceBill.find(filter).populate({ path: 'flatId', populate: { path: 'wingId' } }).sort({ billingPeriod: -1, createdAt: -1 })
}

async function listResidentBills(user) {
  if (!user.flatId) return []
  return MaintenanceBill.find({ societyId: user.societyId, flatId: user.flatId, status: { $ne: 'CANCELLED' } }).populate({ path: 'flatId', populate: { path: 'wingId' } }).sort({ billingPeriod: -1 })
}

async function findResidentBill(user, billId) {
  return MaintenanceBill.findOne({ _id: billId, societyId: user.societyId, flatId: user.flatId, status: { $ne: 'CANCELLED' } }).populate({ path: 'flatId', populate: { path: 'wingId' } })
}

async function payResidentBill(user, billId) {
  // The current checkout only creates a MOCK payment record. Never let it
  // mark a real production bill as paid until a verified provider callback is
  // implemented.
  if (process.env.NODE_ENV === 'production') {
    return { error: 'Online payments are not configured. Please contact society management.' }
  }

  const bill = await MaintenanceBill.findOne({ _id: billId, societyId: user.societyId, flatId: user.flatId })
  if (!bill) return { error: 'Bill not found' }
  if (bill.status === 'CANCELLED') return { error: 'Cancelled bills cannot be paid' }
  if (bill.status === 'PAID') return { error: 'This bill is already paid' }

  let payment = await Payment.findOne({ billId: bill._id })
  if (!payment) {
    const transactionId = `MOCK_${Date.now()}_${user._id.toString().slice(-6)}`
    try {
      payment = await Payment.create({
        societyId: user.societyId,
        billId: bill._id,
        residentId: user._id,
        amount: bill.totalAmount,
        transactionId,
      })
    } catch (error) {
      if (error.code !== 11000) throw error
      payment = await Payment.findOne({ billId: bill._id })
    }
  }

  if (!payment || payment.status !== 'SUCCESS') return { error: 'A successful payment could not be confirmed' }

  const financeResult = await recordMaintenancePayment({ payment, bill, resident: user })
  if (financeResult.error) return financeResult

  bill.status = 'PAID'
  await bill.save()

  await notifyUsers([user._id], {
    societyId: user.societyId,
    type: 'PAYMENT_CONFIRMED',
    title: 'Maintenance payment confirmed',
    message: `Your ${bill.billingPeriod} payment of ₹${payment.amount.toLocaleString('en-IN')} was recorded.`,
    href: `/resident/maintenance/${bill._id}`,
    entityType: 'PAYMENT',
    entityId: payment._id,
    eventKey: `payment-resident:${payment._id}`,
  })
  await notifySocietyAdmins(user.societyId, {
    societyId: user.societyId,
    type: 'PAYMENT_ACTIVITY',
    title: 'Maintenance payment received',
    message: `₹${payment.amount.toLocaleString('en-IN')} received for ${bill.billingPeriod}.`,
    href: '/admin/finance?type=INCOME',
    entityType: 'PAYMENT',
    entityId: payment._id,
    eventKey: `payment-admin:${payment._id}`,
  })

  return {
    bill: await findResidentBill(user, bill._id),
    payment,
    financeTransaction: financeResult.transaction,
  }
}

module.exports = { createBill, listAdminBills, listResidentBills, findResidentBill, payResidentBill }
