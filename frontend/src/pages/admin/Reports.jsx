import { useEffect, useMemo, useState } from 'react'
import { structureApi } from '../../services/api'
import './reports.css'

const now = new Date()
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const monthStart = `${today.slice(0, 8)}01`
const money = (value) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value || 0)
const date = (value) => value ? new Date(value).toLocaleDateString('en-IN') : '—'
const flat = (value) => value ? `${value.wingId?.name ? `${value.wingId.name} · ` : ''}${value.number || ''}` : '—'
const tabs = ['Maintenance', 'Income & expenses', 'Complaints', 'Watchman attendance']

function csvCell(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`
}

export default function Reports() {
  const [from, setFrom] = useState(monthStart)
  const [to, setTo] = useState(today)
  const [appliedRange, setAppliedRange] = useState({ from: monthStart, to: today })
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    structureApi.getReports(new URLSearchParams(appliedRange).toString())
      .then((data) => { if (active) setReport(data) })
      .catch((err) => { if (active) setError(err.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [appliedRange])

  function applyRange() {
    setLoading(true)
    setError('')
    setAppliedRange({ from, to })
  }

  const rows = useMemo(() => {
    if (!report) return []
    if (activeTab === 'Maintenance') return [
      ...report.maintenance.bills.map((item) => ({ Date: item.billingPeriod, Flat: flat(item.flatId), Type: 'Bill', Amount: item.totalAmount, Status: item.status })),
      ...report.maintenance.payments.map((item) => ({ Date: date(item.paidAt), Flat: flat(item.billId?.flatId), Type: 'Payment', Amount: item.amount, Status: item.status, Resident: item.residentId?.name })),
    ]
    if (activeTab === 'Income & expenses') return report.finance.transactions.map((item) => ({ Date: date(item.transactionDate), Type: item.type, Category: item.category.replaceAll('_', ' '), Description: item.description, Amount: item.amount }))
    if (activeTab === 'Complaints') return report.complaints.items.map((item) => ({ Date: date(item.createdAt), Number: item.complaintNumber, Title: item.title, Category: item.category, Flat: flat(item.flatId), Resident: item.residentId?.name, Priority: item.priority, Status: item.status }))
    return report.attendance.items.map((item) => ({ Watchman: item.watchmanId?.name || '—', 'Duty start': date(item.dutyStart), 'Duty end': date(item.dutyEnd), Duration: item.dutyEnd ? `${Math.round((new Date(item.dutyEnd) - new Date(item.dutyStart)) / 60000)} min` : 'On duty', Status: item.status }))
  }, [activeTab, report])

  function downloadCsv() {
    if (!rows.length) return
    const columns = [...new Set(rows.flatMap((row) => Object.keys(row)))]
    const content = [columns, ...rows.map((row) => columns.map((column) => row[column] ?? ''))]
      .map((line) => line.map(csvCell).join(',')).join('\r\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${content}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `sociohub-${activeTab.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}-${appliedRange.from}-to-${appliedRange.to}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const cards = report ? activeTab === 'Maintenance'
    ? [['Total billed', money(report.maintenance.billed)], ['Collected in range', money(report.maintenance.collected)], ['Pending bills', money(report.maintenance.pending)]]
    : activeTab === 'Income & expenses'
      ? [['Society income', money(report.finance.income)], ['Society expenses', money(report.finance.expenses)], ['Net movement', money(report.finance.income - report.finance.expenses)]]
      : activeTab === 'Complaints'
        ? [['Complaints received', report.complaints.total], ['Still open', report.complaints.open]]
        : [['Duty shifts', report.attendance.shifts], ['Completed shifts', report.attendance.completed]]
    : []

  return <section className="admin-page reports-page">
    <div className="admin-header"><div><p className="reports-eyebrow">SOCIETY OVERVIEW</p><h1>Reports</h1><p>Review collections, finances, complaints and staff attendance.</p></div></div>
    <div className="reports-toolbar"><div className="reports-dates"><label>From<input type="date" value={from} max={to} onChange={(event) => setFrom(event.target.value)} /></label><label>To<input type="date" value={to} min={from} max={today} onChange={(event) => setTo(event.target.value)} /></label><button className="reports-apply" onClick={applyRange} disabled={!from || !to || from > to}>Apply range</button></div><button className="reports-export" onClick={downloadCsv} disabled={loading || !rows.length}>Download CSV</button></div>
    <div className="reports-tabs" role="tablist" aria-label="Report type">{tabs.map((tab) => <button role="tab" aria-selected={activeTab === tab} className={activeTab === tab ? 'selected' : ''} key={tab} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>
    {loading ? <div className="reports-state">Loading reports…</div> : error ? <div className="reports-state reports-error" role="alert">{error}</div> : <>
      <div className="reports-cards">{cards.map(([label, value]) => <article className="reports-card" key={label}><span>{label}</span><strong>{value}</strong></article>)}</div>
      <div className="reports-table-wrap"><div className="reports-table-heading"><div><h2>{activeTab}</h2><span>{rows.length} records · {appliedRange.from} to {appliedRange.to}</span></div></div>
        {rows.length ? <div className="reports-table-scroll"><table><thead><tr>{Object.keys(rows[0]).map((key) => <th key={key}>{key}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={`${index}-${Object.values(row)[0]}`}>{Object.values(row).map((value, cellIndex) => <td key={cellIndex}>{String(value ?? '—')}</td>)}</tr>)}</tbody></table></div> : <div className="reports-empty">No records found for this date range.</div>}
      </div>
    </>}
  </section>
}
