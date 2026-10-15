export default function BillStatus({ status }) {
  return <span className={`bill-status ${status.toLowerCase()}`}>{status}</span>
}
