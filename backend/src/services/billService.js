const Flat = require('../models/Flat')
const MaintenanceBill = require('../models/MaintenanceBill')
const { notifyFlatResidents } = require('./notificationService')

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

module.exports = { createBill, listAdminBills, listResidentBills, findResidentBill }
