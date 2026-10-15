const { createBill, findResidentBill, listAdminBills, listResidentBills } = require('../services/billService')
const { getAdminSocietyId, isValidId } = require('../utils/structureControllerUtils')
const Society = require('../models/Society')
const Payment = require('../models/Payment')
const { createOrder, verifyPayment, processWebhook } = require('../services/razorpayService')

async function createMaintenanceBill(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined

    const { flatId, billingPeriod, maintenanceAmount, fineAmount, dueDate, notes } = request.body
    if (!flatId || !billingPeriod || maintenanceAmount === undefined || !dueDate) {
      return response.status(400).json({ message: 'flatId, billingPeriod, maintenanceAmount, and dueDate are required' })
    }
    if (!isValidId(flatId)) return response.status(400).json({ message: 'A valid flatId is required' })

    const result = await createBill({ societyId, createdBy: request.user._id, data: { flatId, billingPeriod, maintenanceAmount, fineAmount, dueDate, notes } })
    if (result.error) return response.status(400).json({ message: result.error })
    return response.status(201).json({ bill: result.bill })
  } catch (error) {
    return next(error)
  }
}

async function getAdminBills(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    const bills = await listAdminBills(societyId, request.query)
    return response.json({ bills })
  } catch (error) {
    return next(error)
  }
}

async function getResidentBills(request, response, next) {
  try {
    const bills = await listResidentBills(request.user)
    return response.json({ bills })
  } catch (error) {
    return next(error)
  }
}

async function getResidentBill(request, response, next) {
  try {
    if (!isValidId(request.params.id)) return response.status(404).json({ message: 'Bill not found' })
    const bill = await findResidentBill(request.user, request.params.id)
    if (!bill) return response.status(404).json({ message: 'Bill not found' })
    const [society, payment] = await Promise.all([
      Society.findById(request.user.societyId).select('name address contactEmail contactPhone'),
      Payment.findOne({ billId: bill._id, residentId: request.user._id, status: 'SUCCESS' }),
    ])
    return response.json({ bill, society, resident: request.user, payment })
  } catch (error) {
    return next(error)
  }
}

async function createResidentPaymentOrder(request, response, next) {
  try {
    if (!isValidId(request.params.id)) return response.status(404).json({ message: 'Bill not found' })
    const result = await createOrder(request.user, request.params.id)
    if (result.error) return response.status(400).json({ message: result.error })
    return response.json(result)
  } catch (error) {
    return next(error)
  }
}

async function verifyResidentPayment(request, response, next) {
  try {
    const result = await verifyPayment(request.user, request.body)
    if (result.error) return response.status(400).json({ message: result.error })
    const society = await Society.findById(request.user.societyId).select('name address contactEmail contactPhone')
    return response.json({ message: 'Payment successful', ...result, society, resident: request.user })
  } catch (error) {
    return next(error)
  }
}

async function razorpayWebhook(request, response) {
  try {
    const result = await processWebhook(request.body, request.get('x-razorpay-signature'))
    if (result.error) return response.status(400).json({ message: result.error })
    return response.json({ received: true })
  } catch (error) {
    console.error('Razorpay webhook processing failed:', error)
    return response.status(500).json({ message: 'Webhook processing failed' })
  }
}

module.exports = { createMaintenanceBill, getAdminBills, getResidentBills, getResidentBill, createResidentPaymentOrder, verifyResidentPayment, razorpayWebhook }
