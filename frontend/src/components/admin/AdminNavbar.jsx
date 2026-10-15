import NotificationBell from '../NotificationBell'
import { Link } from 'react-router-dom'

export default function AdminNavbar() {
  const user = JSON.parse(localStorage.getItem('sociohub_user') || '{}')
  return <header className="admin-navbar"><div><p className="admin-breadcrumb">Admin workspace</p><strong>SocioHub management</strong></div><div className="admin-user"><NotificationBell /><Link to="/admin/profile" className="admin-profile-link" aria-label="Open my profile"><span className="admin-avatar">{user.name?.slice(0, 2).toUpperCase() || 'AD'}</span><span><strong>{user.name || 'Administrator'}</strong><small>My profile</small></span></Link></div></header>
}
