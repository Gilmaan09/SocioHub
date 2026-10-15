const crypto = require('crypto')
const MaintenanceBill = require('../models/MaintenanceBill')
const Payment = require('../models/Payment')
const { recordMaintenancePayment } = require('./financeService')
const { notifySocietyAdmins, notifyUsers } = require('./notificationService')

function getCredentials() {
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    const error = new Error('Razorpay is not configured. Add the backend API keys to backend/.env.')
    error.status = 503
    throw error
  }
  return { keyId: RAZORPAY_KEY_ID, keySecret: RAZORPAY_KEY_SECRET }
}

async function razorpayRequest(path, options = {}) {
  const { keyId, keySecret } = getCredentials()
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error?.description || 'Razorpay request failed')
    error.status = response.status
    throw error
  }
  return data
}

async function createOrder(user, billId) {
  const bill = await MaintenanceBill.findOne({
    _id: billId,
    societyId: user.societyId,
    flatId: user.flatId,
  })
  if (!bill) return { error: 'Bill not found' }
  if (bill.status === 'CANCELLED') return { error: 'Cancelled bills cannot be paid' }
  if (bill.status === 'PAID') return { error: 'This bill is already paid' }

  let payment = await Payment.findOne({ billId: bill._id })
  if (payment?.status === 'SUCCESS') return { error: 'This bill is already paid' }

  const credentials = getCredentials()
  let order
  if (payment?.status === 'PENDING' && payment.gatewayOrderId && payment.amount === bill.totalAmount) {
    order = { id: payment.gatewayOrderId, amount: Math.round(payment.amount * 100), currency: 'INR' }
  } else {
    order = await razorpayRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        amount: Math.round(bill.totalAmount * 100),
        currency: 'INR',
        receipt: `bill_${String(bill._id)}`,
        notes: { billId: String(bill._id), societyId: String(user.societyId), residentId: String(user._id) },
      }),
    })
    payment = await Payment.findOneAndUpdate(
      { billId: bill._id },
      {
        $set: {
          societyId: user.societyId,
          residentId: user._id,
          amount: bill.totalAmount,
          paymentMethod: 'RAZORPAY',
          status: 'PENDING',
          transactionId: `RZP_ORDER_${order.id}`,
          gatewayOrderId: order.id,
        },
        $unset: { gatewayPaymentId: 1, paidAt: 1 },
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    )
  }

  return {
    order: { id: order.id, amount: order.amount, currency: order.currency },
    keyId: credentials.keyId,
    bill: { id: bill._id, amount: bill.totalAmount },
  }
}

function safeEqualHex(left, right) {
  if (!/^[a-f\d]+$/i.test(left) || !/^[a-f\d]+$/i.test(right) || left.length !== right.length) return false
  return crypto.timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'))
}

async function confirmCapturedPayment(payment, providerPaymentId, resident) {
  const bill = await MaintenanceBill.findOne({ _id: payment.billId, societyId: payment.societyId })
  if (!bill || bill.status === 'CANCELLED') return { error: 'Bill is no longer payable' }

  if (payment.status !== 'SUCCESS') {
    payment.status = 'SUCCESS'
    payment.gatewayPaymentId = providerPaymentId
    payment.transactionId = providerPaymentId
    payment.paidAt = new Date()
    await payment.save()
  }

  const financeResult = await recordMaintenancePayment({ payment, bill, resident })
  if (financeResult.error) return financeResult
  bill.status = 'PAID'
  await bill.save()

  await notifyUsers([resident._id], {
    societyId: payment.societyId,
    type: 'PAYMENT_CONFIRMED',
    title: 'Maintenance payment confirmed',
    message: `Your ${bill.billingPeriod} payment of ₹${payment.amount.toLocaleString('en-IN')} was recorded.`,
    href: `/resident/maintenance/${bill._id}`,
    entityType: 'PAYMENT',
    entityId: payment._id,
    eventKey: `payment-resident:${payment._id}`,
  })
  await notifySocietyAdmins(payment.societyId, {
    societyId: payment.societyId,
    type: 'PAYMENT_ACTIVITY',
    title: 'Maintenance payment received',
    message: `₹${payment.amount.toLocaleString('en-IN')} received for ${bill.billingPeriod}.`,
    href: '/admin/finance?type=INCOME',
    entityType: 'PAYMENT',
    entityId: payment._id,
    eventKey: `payment-admin:${payment._id}`,
  })
  return { payment, bill, financeTransaction: financeResult.transaction }
}

async function verifyPayment(user, details) {
  const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = details
  if (!orderId || !paymentId || !signature) return { error: 'Payment verification details are incomplete' }
  const payment = await Payment.findOne({
    gatewayOrderId: orderId,
    societyId: user.societyId,
    residentId: user._id,
    status: { $ne: 'FAILED' },
  })
  if (!payment) return { error: 'Payment order not found' }

  const { keySecret } = getCredentials()
  const expectedSignature = crypto.createHmac('sha256', keySecret).update(`${orderId}|${paymentId}`).digest('hex')
  if (!safeEqualHex(expectedSignature, signature)) return { error: 'Payment signature could not be verified' }

  const providerPayment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`)
  if (providerPayment.order_id !== orderId || providerPayment.amount !== Math.round(payment.amount * 100) || providerPayment.currency !== 'INR') {
    return { error: 'Payment details do not match this bill' }
  }
  if (providerPayment.status !== 'captured') {
    return { error: 'Payment has not been captured yet. Your receipt will update once it is confirmed.' }
  }

  return confirmCapturedPayment(payment, paymentId, user)
}

async function processWebhook(rawBody, signature) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret || !signature) return { error: 'Webhook verification is not configured' }
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
  if (!safeEqualHex(expected, signature)) return { error: 'Invalid webhook signature' }
  const event = JSON.parse(rawBody.toString('utf8'))
  if (event.event !== 'payment.captured') return { ignored: true }

  const providerPayment = event.payload?.payment?.entity
  if (!providerPayment?.order_id || !providerPayment?.id) return { error: 'Invalid payment event' }
  const payment = await Payment.findOne({ gatewayOrderId: providerPayment.order_id, status: { $ne: 'FAILED' } })
  if (!payment || providerPayment.amount !== Math.round(payment.amount * 100) || providerPayment.currency !== 'INR') {
    return { error: 'Payment order does not match a pending SocioHub bill' }
  }
  const resident = await require('../models/User').findById(payment.residentId)
  if (!resident) return { error: 'Resident account not found' }
  return confirmCapturedPayment(payment, providerPayment.id, resident)
}

module.exports = { createOrder, verifyPayment, processWebhook }
