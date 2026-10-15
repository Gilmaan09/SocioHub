export default function StatCard({ label, value, detail, tone = '' }) {
  return <article className={`admin-stat-card ${tone}`}><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}
