import BillStatus from './BillStatus'

export default function BillCard({ bill, onSelect }) {
  return <button type="button" className="bill-card" onClick={() => onSelect?.(bill)}><div><strong>{bill.billingPeriod}</strong><small>{bill.flatId?.wingId?.name}-{bill.flatId?.number}</small></div><div><strong>₹{bill.totalAmount.toLocaleString('en-IN')}</strong><small>Due {new Date(bill.dueDate).toLocaleDateString('en-IN')}</small></div><BillStatus status={bill.status} /></button>
}
