import { useEffect, useState } from 'react'
import BillForm from '../../../components/maintenance/BillForm'
import BillTable from '../../../components/maintenance/BillTable'
import { structureApi } from '../../../services/api'
import '../admin.css'
import './maintenance.css'

export default function Bills() {
  const [bills, setBills] = useState([])
  const [flats, setFlats] = useState([])
  const [error, setError] = useState('')
  async function load() { const [billResult, flatResult] = await Promise.all([structureApi.getAdminBills(), structureApi.getFlats()]); setBills(billResult.bills); setFlats(flatResult.flats) }
  useEffect(() => { let cancelled = false; Promise.all([structureApi.getAdminBills(), structureApi.getFlats()]).then(([billResult, flatResult]) => { if (!cancelled) { setBills(billResult.bills); setFlats(flatResult.flats) } }).catch((requestError) => { if (!cancelled) setError(requestError.message) }); return () => { cancelled = true } }, [])
  async function createBill(form) { try { await structureApi.createBill(form); await load() } catch (requestError) { setError(requestError.message) } }
  return <section className="admin-page"><header className="admin-header"><div><p className="page-kicker">Maintenance</p><h1>Bills</h1><p>Create and track maintenance bills for your society flats.</p></div></header>{error && <p className="form-error">{error}</p>}<div className="maintenance-layout"><BillForm flats={flats} onSubmit={createBill} /><div><div className="maintenance-summary"><span>Total bills <strong>{bills.length}</strong></span><span>Expected <strong>₹{bills.reduce((sum, bill) => sum + bill.totalAmount, 0).toLocaleString('en-IN')}</strong></span><span>Pending <strong>{bills.filter((bill) => bill.status !== 'PAID' && bill.status !== 'CANCELLED').length}</strong></span></div><BillTable bills={bills} /></div></div></section>
}
