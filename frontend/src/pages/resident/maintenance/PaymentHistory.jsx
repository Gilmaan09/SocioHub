import { useEffect, useState } from 'react'
import BillStatus from '../../../components/maintenance/BillStatus'
import { structureApi } from '../../../services/api'
import './maintenance.css'

export default function PaymentHistory() {
  const [bills, setBills] = useState([])
  useEffect(() => { structureApi.getMyBills().then(({ bills: currentBills }) => setBills(currentBills)) }, [])
  return <section className="resident-page"><p className="page-kicker">Society payments</p><h1>Payment history</h1><div className="resident-bill-list">{bills.map((bill) => <article className="resident-bill" key={bill._id}><div><strong>{bill.billingPeriod}</strong><span>{new Date(bill.dueDate).toLocaleDateString('en-IN')}</span></div><div><strong>₹{bill.totalAmount.toLocaleString('en-IN')}</strong><BillStatus status={bill.status} /></div></article>)}</div></section>
}
