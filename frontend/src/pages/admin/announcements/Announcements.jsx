import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import AnnouncementCard from '../../../components/announcements/AnnouncementCard'
import { structureApi } from '../../../services/api'
import '../admin.css'
import './announcements.css'

export default function Announcements() {
  const location = useLocation()
  const [items, setItems] = useState([]); const [error, setError] = useState('')
  useEffect(() => { structureApi.getAdminAnnouncements().then(({ announcements }) => setItems(announcements)).catch((requestError) => setError(requestError.message)) }, [])
  async function remove(item) { if (!window.confirm(`Delete ${item.title}?`)) return; try { await structureApi.deleteAnnouncement(item._id); setItems(items.filter((entry) => entry._id !== item._id)) } catch (requestError) { setError(requestError.message) } }
  return <section className="admin-page"><header className="admin-header"><div><p className="page-kicker">Communication</p><h1>Announcements</h1><p>Keep residents informed about society updates.</p></div><Link className="admin-primary-action" to="/admin/announcements/new">Create announcement</Link></header>{location.state?.notice && <p className="announcement-success" role="status">{location.state.notice}</p>}{error && <p className="form-error">{error}</p>}<div className="announcement-grid">{items.map((item) => <AnnouncementCard key={item._id} announcement={item} basePath="/admin/announcements" onDelete={remove} />)}{items.length === 0 && !error && <p className="empty-state">No announcements created yet.</p>}</div></section>
}
