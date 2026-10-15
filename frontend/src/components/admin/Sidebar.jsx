import { NavLink } from 'react-router-dom'

const sections = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: '⌂' },
  { label: 'Society', items: [['Society details', '/admin/society'], ['Wings', '/admin/wings'], ['Flats', '/admin/flats'], ['Parking', '/admin/parking']] },
  { label: 'Residents', to: '/admin/residents', icon: '◉' },
  { label: 'Maintenance', items: [['Bills', '/admin/maintenance/bills'], ['Payments', '#'], ['Fines', '#']] },
  { label: 'Finance', items: [['Income', '/admin/finance?type=INCOME'], ['Expenses', '/admin/finance?type=EXPENSE'], ['Society fund', '/admin/finance']] },
  { label: 'Complaints', to: '/admin/complaints', icon: '!' },
  { label: 'Community', to: '#', icon: '◌' },
  { label: 'Announcements', to: '/admin/announcements', icon: '◫' },
  {
    label: 'Security',
    items: [
      ['Watchmen', '/admin/watchmen'],
      ['Attendance', '/admin/watchman-attendance'],
    ],
  }, { label: 'Reports', to: '/admin/reports', icon: '▥' },
] 

export default function Sidebar() {
  return <aside className="admin-sidebar"><div className="admin-brand"><span className="brand-mark">S</span><span>Socio<span>Hub</span></span></div><p className="admin-label">Admin workspace</p><nav>{sections.map((section) => section.items ? <div className="admin-nav-group" key={section.label}><p>{section.label}</p>{section.items.map(([label, to]) => <NavLink key={label} to={to}>{label}</NavLink>)}</div> : <NavLink key={section.label} to={section.to} className="admin-nav-link"><span>{section.icon}</span>{section.label}</NavLink>)}</nav><button className="admin-signout" type="button" onClick={() => { localStorage.clear(); window.location.href = '/login' }}>Sign out</button></aside>
}
