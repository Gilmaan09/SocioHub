import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { structureApi } from '../../services/api'
import './admin.css'
import './finance.css'

const money = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount || 0)
const incomeCategories = [['OTHER_INCOME', 'Other income'], ['DONATION', 'Donation'], ['INTEREST', 'Interest'], ['PARKING', 'Parking'], ['FINE', 'Fine']]
const expenseCategories = [['SECURITY_SALARY', 'Security salaries'], ['CLEANING', 'Cleaning'], ['REPAIRS', 'Repairs'], ['COMMON_AREA', 'Common-area expenses'], ['UTILITIES', 'Utilities'], ['OTHER_EXPENSE', 'Other expense']]
const initialEntry = { type: 'INCOME', category: 'OTHER_INCOME', amount: '', description: '', transactionDate: new Date().toISOString().slice(0, 10), receiptUrl: '' }

export default function Finance() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [summary, setSummary] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [entry, setEntry] = useState(initialEntry)
  const [opening, setOpening] = useState({ amount: '', description: 'Opening society fund balance', transactionDate: new Date().toISOString().slice(0, 10) })
  const [filters, setFilters] = useState({ from: '', to: '' })
  const typeFilter = ['INCOME', 'EXPENSE'].includes(searchParams.get('type')) ? searchParams.get('type') : ''
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)

  async function refresh(filtersToUse = filters, transactionType = typeFilter) {
    const query = new URLSearchParams(Object.entries({ ...filtersToUse, type: transactionType }).filter(([, value]) => value)).toString()
    const [summaryResult, transactionResult] = await Promise.all([
      structureApi.getFinanceSummary(),
      structureApi.getFinanceTransactions(query),
    ])
    setSummary(summaryResult.summary)
    setTransactions(transactionResult.transactions)
  }

  useEffect(() => {
    let cancelled = false
    const query = new URLSearchParams(Object.entries({ ...filters, type: typeFilter }).filter(([, value]) => value)).toString()
    Promise.all([structureApi.getFinanceSummary(), structureApi.getFinanceTransactions(query)])
      .then(([summaryResult, transactionResult]) => {
        if (!cancelled) {
          setSummary(summaryResult.summary)
          setTransactions(transactionResult.transactions)
        }
      })
      .catch((requestError) => { if (!cancelled) setError(requestError.message) })
    return () => { cancelled = true }
  }, [filters, typeFilter])

  async function submitOpening(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      await structureApi.setOpeningBalance({ ...opening, amount: Number(opening.amount) })
      setNotice('Opening balance saved.')
      await refresh()
    } catch (requestError) { setError(requestError.message) }
    finally { setSaving(false) }
  }

  async function submitEntry(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      await structureApi.createFinanceTransaction({ ...entry, amount: Number(entry.amount) })
      setNotice(`${entry.type === 'INCOME' ? 'Income' : 'Expense'} recorded.`)
      setEntry({ ...initialEntry, type: entry.type, category: entry.type === 'INCOME' ? 'OTHER_INCOME' : 'SECURITY_SALARY' })
      await refresh()
    } catch (requestError) { setError(requestError.message) }
    finally { setSaving(false) }
  }

  function changeType(type) {
    setEntry({ ...entry, type, category: type === 'INCOME' ? 'OTHER_INCOME' : 'SECURITY_SALARY' })
  }

  function updateFilter(event) {
    if (event.target.name === 'type') {
      const nextType = event.target.value
      if (nextType) setSearchParams({ type: nextType })
      else setSearchParams({})
      return
    }
    const nextFilters = { ...filters, [event.target.name]: event.target.value }
    setFilters(nextFilters)
  }

  return (
    <section className="admin-page finance-page">
      <header className="admin-header">
        <div><p className="page-kicker">Society accounts</p><h1>Finance & fund</h1><p>Keep society income, expenses, and available funds in view.</p></div>
      </header>
      {error && <p className="form-error">{error}</p>}
      {notice && <p className="finance-notice">{notice}</p>}

      <div className="fund-summary-grid">
        <article className="fund-summary-card balance-card"><span>Current fund balance</span><strong>{money(summary?.currentBalance)}</strong><small>Opening balance + income - expenses</small></article>
        <article className="fund-summary-card"><span>Opening balance</span><strong>{money(summary?.openingBalance)}</strong><small>{summary?.openingBalanceSet ? 'Initial recorded fund' : 'Not set yet'}</small></article>
        <article className="fund-summary-card income-total"><span>Total income</span><strong>{money(summary?.totalIncome)}</strong><small>Recorded society receipts</small></article>
        <article className="fund-summary-card expense-total"><span>Total expenses</span><strong>{money(summary?.totalExpenses)}</strong><small>Recorded society spending</small></article>
      </div>

      {!summary?.openingBalanceSet && <form className="opening-balance-form" onSubmit={submitOpening}>
        <div><p className="finance-kicker">Starting point</p><h2>Set opening fund balance</h2><p>Enter the society’s current balance once to begin the ledger.</p></div>
        <label>Opening amount<input type="number" min="0" step="0.01" value={opening.amount} onChange={(event) => setOpening({ ...opening, amount: event.target.value })} required /></label>
        <label>As of date<input type="date" value={opening.transactionDate} onChange={(event) => setOpening({ ...opening, transactionDate: event.target.value })} required /></label>
        <label>Description<input value={opening.description} onChange={(event) => setOpening({ ...opening, description: event.target.value })} required /></label>
        <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Set opening balance'}</button>
      </form>}

      <div className="finance-workspace">
        <form className="admin-form finance-entry-form" onSubmit={submitEntry}>
          <p className="finance-kicker">Ledger entry</p><h2>Record transaction</h2>
          <div className="finance-type-switch" role="group" aria-label="Transaction type"><button type="button" className={entry.type === 'INCOME' ? 'selected income' : ''} onClick={() => changeType('INCOME')}>Income</button><button type="button" className={entry.type === 'EXPENSE' ? 'selected expense' : ''} onClick={() => changeType('EXPENSE')}>Expense</button></div>
          <label>Category<select value={entry.category} onChange={(event) => setEntry({ ...entry, category: event.target.value })}>{(entry.type === 'INCOME' ? incomeCategories : expenseCategories).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
          <label>Amount<input type="number" min="0.01" step="0.01" value={entry.amount} onChange={(event) => setEntry({ ...entry, amount: event.target.value })} required /></label>
          <label>Date<input type="date" value={entry.transactionDate} onChange={(event) => setEntry({ ...entry, transactionDate: event.target.value })} required /></label>
          <label>Description<input value={entry.description} onChange={(event) => setEntry({ ...entry, description: event.target.value })} maxLength="500" required /></label>
          <label>Receipt URL <span className="optional-label">Optional</span><input type="url" value={entry.receiptUrl} onChange={(event) => setEntry({ ...entry, receiptUrl: event.target.value })} /></label>
          <button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : `Record ${entry.type === 'INCOME' ? 'income' : 'expense'}`}</button>
        </form>

        <section className="finance-ledger">
          <div className="finance-ledger-heading"><div><p className="finance-kicker">Society ledger</p><h2>Transactions</h2><small>{summary?.transactionCount || 0} recorded entries</small></div><div className="finance-filters"><select name="type" aria-label="Filter by type" value={typeFilter} onChange={updateFilter}><option value="">All types</option><option value="INCOME">Income</option><option value="EXPENSE">Expense</option></select><input name="from" aria-label="From date" type="date" value={filters.from} onChange={updateFilter} /><input name="to" aria-label="To date" type="date" value={filters.to} onChange={updateFilter} /></div></div>
          <div className="finance-table-wrap"><table className="finance-table"><thead><tr><th>Date</th><th>Type</th><th>Category / Description</th><th>Recorded by</th><th className="amount-cell">Amount</th></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction._id}><td>{new Date(transaction.transactionDate).toLocaleDateString('en-IN')}</td><td><span className={`finance-type-tag ${transaction.type.toLowerCase()}`}>{transaction.type.replace('_', ' ')}</span></td><td><strong>{transaction.category.replaceAll('_', ' ')}</strong><small>{transaction.description}</small></td><td>{transaction.createdBy?.name || 'Admin'}</td><td className={`amount-cell ${transaction.type === 'EXPENSE' ? 'negative' : 'positive'}`}>{transaction.type === 'EXPENSE' ? '−' : '+'}{money(transaction.amount)}</td></tr>)}</tbody></table>{transactions.length === 0 && <p className="finance-empty">No transactions match these filters.</p>}</div>
        </section>
      </div>
    </section>
  )
}
