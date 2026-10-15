const activities = [
  { title: 'Society finance', detail: 'Fund balance, income, expenses and transactions are available.', status: 'Ready', tone: 'ready' },
  { title: 'Maintenance', detail: 'Create bills and review recorded payments.', status: 'Ready', tone: 'ready' },
  { title: 'Resident accounts', detail: 'Manage assigned residents and their flat details.', status: 'Ready', tone: 'ready' },
]

export default function RecentActivity() {
  return <section className="admin-panel"><div className="admin-panel-heading"><div><p className="admin-kicker">Workspace pulse</p><h2>Recent activity</h2></div><button type="button" className="admin-link">View all</button></div><div className="activity-list">{activities.map((activity) => <article key={activity.title}><span className={`activity-dot ${activity.tone}`} /><div><strong>{activity.title}</strong><p>{activity.detail}</p></div><em className={activity.tone}>{activity.status}</em></article>)}</div></section>
}
