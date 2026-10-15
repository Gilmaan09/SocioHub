import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BillStatus from '../../../components/maintenance/BillStatus'
import { structureApi } from '../../../services/api'
import './maintenance.css'

const money = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const dateTime = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)) : '—'
const date = (value) => value ? new Intl.DateTimeFormat('en-IN', { dateStyle: 'long' }).format(new Date(value)) : '—'
const getSignedInResident = () => {
  try { return JSON.parse(localStorage.getItem('sociohub_user') || 'null') } catch { return null }
}
const demoPaymentsEnabled = import.meta.env.DEV

export default function BillDetails() {
  const { id } = useParams()
  const [bill, setBill] = useState(null)
  const [payment, setPayment] = useState(null)
  const [society, setSociety] = useState(null)
  const [resident, setResident] = useState(getSignedInResident)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)

  useEffect(() => {
    structureApi.getMyBill(id)
      .then((result) => {
        setBill(result.bill)
        setPayment(result.payment)
        setSociety(result.society)
        setResident(result.resident)
      })
      .catch((requestError) => setError(requestError.message))
  }, [id])

  async function payNow() {
    setError('')
    setPaying(true)
    try {
      const result = await structureApi.payMyBill(id)
      setBill(result.bill)
      setPayment(result.payment)
      setSociety(result.society)
      setResident(result.resident)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setPaying(false)
    }
  }

  const flat = bill?.flatId
  const flatLabel = flat ? `${flat.wingId?.name ? `Wing ${flat.wingId.name} · ` : ''}${flat.number}` : '—'

  return (
    <section className="resident-page">
      <Link className="back-link" to="/resident/maintenance">← All bills</Link>
      <p className="page-kicker">Society payments</p>
      <h1>{payment ? 'Payment receipt' : 'Maintenance bill'}</h1>
      <p className="resident-intro">{payment ? 'Your payment has been recorded. Keep this receipt for your records.' : 'Review your bill details before completing payment.'}</p>
      {error && <p className="form-error">{error}</p>}

      {bill && <article className="detail-panel maintenance-document" id="maintenance-receipt">
        <header className="document-brand">
          <div className="document-brand-mark">SH</div>
          <div>
            <p className="page-kicker">{payment ? 'Official payment receipt' : 'Maintenance invoice'}</p>
            <h2>{society?.name || 'Society'}</h2>
            {society?.address && <p>{society.address}</p>}
            {(society?.contactPhone || society?.contactEmail) && <p>{[society.contactPhone, society.contactEmail].filter(Boolean).join(' · ')}</p>}
          </div>
          <BillStatus status={bill.status} />
        </header>

        <div className="document-meta-grid">
          <div><span>{payment ? 'Receipt number' : 'Bill reference'}</span><strong>{payment ? `RCT-${String(payment._id).slice(-8).toUpperCase()}` : `BILL-${String(bill._id).slice(-8).toUpperCase()}`}</strong></div>
          <div><span>Billing period</span><strong>{bill.billingPeriod}</strong></div>
          <div><span>Bill issued</span><strong>{date(bill.createdAt)}</strong></div>
          <div><span>Due date</span><strong>{date(bill.dueDate)}</strong></div>
        </div>

        <div className="document-parties">
          <div><span>Bill to</span><strong>{resident?.name || 'Resident'}</strong><p>{resident?.email || '—'}</p><p>{resident?.phone || '—'}</p></div>
          <div><span>Property</span><strong>{flatLabel}</strong><p>{resident?.role === 'TENANT' ? 'Resident · Tenant' : 'Resident · Owner'}</p></div>
        </div>

        <div className="document-lines">
          <div className="document-table-head"><span>Description</span><span>Amount</span></div>
          <div><span>Society maintenance · {bill.billingPeriod}</span><strong>{money(bill.maintenanceAmount)}</strong></div>
          {Number(bill.fineAmount) > 0 && <div><span>Late payment charge</span><strong>{money(bill.fineAmount)}</strong></div>}
          <div className="document-total"><span>Total {payment ? 'paid' : 'due'}</span><strong>{money(bill.totalAmount)}</strong></div>
        </div>

        {payment ? <section className="receipt-payment-info">
          <div className="receipt-success-mark">✓</div>
          <div className="receipt-payment-heading"><strong>Payment successful</strong><span>Paid on {dateTime(payment.paidAt)}</span></div>
          <div className="receipt-payment-grid">
            <div><span>Transaction ID</span><strong>{payment.transactionId}</strong></div>
            <div><span>Payment method</span><strong>{payment.paymentMethod === 'MOCK' ? 'Demo payment' : payment.paymentMethod}</strong></div>
            <div><span>Received by</span><strong>{society?.name || 'Society management'}</strong></div>
            <div><span>Payment status</span><strong>Successful</strong></div>
          </div>
        </section> : <div className="bill-payment-note"><strong>Payment summary</strong><span>Amount payable: {money(bill.totalAmount)}</span><span>{demoPaymentsEnabled ? 'Demo checkout is enabled for local development.' : 'Online payment is not configured. Please contact society management.'}</span></div>}

        <footer className="document-footer"><span>This is a computer-generated {payment ? 'receipt' : 'bill'} from SocioHub.</span><button type="button" className="secondary-button receipt-print-button" onClick={() => window.print()}>Download PDF</button></footer>
        {!payment && demoPaymentsEnabled && bill.status !== 'PAID' && <button type="button" className="primary-button payment-placeholder" onClick={payNow} disabled={paying}>{paying ? 'Processing demo payment…' : `Pay ${money(bill.totalAmount)} · Demo`}</button>}
      </article>}
    </section>
  )
}
