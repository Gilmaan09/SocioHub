import { Outlet } from 'react-router-dom'
import Sidebar from '../components/admin/Sidebar'
import AdminNavbar from '../components/admin/AdminNavbar'
import './admin-layout.css'

export default function AdminLayout() {
  return <div className="admin-shell"><Sidebar /><div className="admin-main"><AdminNavbar /><main><Outlet /></main></div></div>
}
