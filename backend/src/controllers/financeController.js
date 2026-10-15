const { getAdminSocietyId } = require('../utils/structureControllerUtils')
const { getFundSummary, listTransactions, recordTransaction, setOpeningBalance } = require('../services/financeService')

function parseAmount(value) {
  const amount = Number(value)
  return Number.isFinite(amount) && amount >= 0 ? amount : null
}

function validDate(value) {
  return value === undefined || value === '' || !Number.isNaN(new Date(value).getTime())
}

async function summary(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    return response.json({ summary: await getFundSummary(societyId) })
  } catch (error) { return next(error) }
}

async function transactions(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    return response.json({ transactions: await listTransactions(societyId, request.query) })
  } catch (error) { return next(error) }
}

async function createTransaction(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    const { type, category, amount, description, transactionDate, receiptUrl } = request.body
    if (!type || !category || amount === undefined || !description) {
      return response.status(400).json({ message: 'Type, category, amount, and description are required' })
    }
    if (!validDate(transactionDate)) return response.status(400).json({ message: 'Transaction date is invalid' })
    const result = await recordTransaction({ societyId, createdBy: request.user._id, data: { type, category, amount, description, transactionDate, receiptUrl } })
    if (result.error) return response.status(400).json({ message: result.error })
    return response.status(201).json(result)
  } catch (error) { return next(error) }
}

async function createOpeningBalance(request, response, next) {
  try {
    const societyId = getAdminSocietyId(request, response)
    if (!societyId) return undefined
    const amount = parseAmount(request.body.amount)
    const { description, transactionDate } = request.body
    if (amount === null || !description) return response.status(400).json({ message: 'A valid amount and description are required' })
    if (!validDate(transactionDate)) return response.status(400).json({ message: 'Transaction date is invalid' })
    const result = await setOpeningBalance({ societyId, createdBy: request.user._id, amount, transactionDate, description })
    if (result.error) return response.status(409).json({ message: result.error })
    return response.status(201).json(result)
  } catch (error) { return next(error) }
}

module.exports = { summary, transactions, createTransaction, createOpeningBalance }
