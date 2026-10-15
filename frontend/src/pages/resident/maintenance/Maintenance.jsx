import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BillStatus from '../../../components/maintenance/BillStatus'
import { structureApi } from '../../../services/api'
import './maintenance.css'

export default function Maintenance() {
  const [bills, setBills] = useState([])
  const [error, setError] = useState('')
  useEffect(() => { let cancelled = false; structureApi.getMyBills().then(({ bills: currentBills }) => { if (!cancelled) setBills(currentBills) }).catch((requestError) => { if (!cancelled) setError(requestError.message) }); return () => { cancelled = true } }, [])
  return <section className="resident-page"><p className="page-kicker">Society payments</p><h1>Maintenance</h1><p className="resident-intro">View and securely pay your society maintenance bills.</p>{error && <p className="form-error">{error}</p>}<div className="resident-bill-list">{bills.map((bill) => <Link to={`/resident/maintenance/${bill._id}`} className="resident-bill" key={bill._id}><div><strong>{bill.billingPeriod}</strong><span>Due {new Date(bill.dueDate).toLocaleDateString('en-IN')}</span></div><div><strong>₹{bill.totalAmount.toLocaleString('en-IN')}</strong><BillStatus status={bill.status} /></div></Link>)}{bills.length === 0 && !error && <p className="empty-state">No maintenance bills are assigned to your flat.</p>}</div></section>
}
