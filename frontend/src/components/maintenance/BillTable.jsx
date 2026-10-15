import BillStatus from './BillStatus'

export default function BillTable({ bills }) {
  return <div className="bill-table-wrap"><table className="bill-table"><thead><tr><th>Period</th><th>Flat</th><th>Maintenance</th><th>Fine</th><th>Total</th><th>Due date</th><th>Status</th></tr></thead><tbody>{bills.map((bill) => <tr key={bill._id}><td>{bill.billingPeriod}</td><td>{bill.flatId?.wingId?.name}-{bill.flatId?.number}</td><td>₹{bill.maintenanceAmount.toLocaleString('en-IN')}</td><td>₹{bill.fineAmount.toLocaleString('en-IN')}</td><td><strong>₹{bill.totalAmount.toLocaleString('en-IN')}</strong></td><td>{new Date(bill.dueDate).toLocaleDateString('en-IN')}</td><td><BillStatus status={bill.status} /></td></tr>)}</tbody></table>{bills.length === 0 && <p className="empty-state">No maintenance bills found.</p>}</div>
}
