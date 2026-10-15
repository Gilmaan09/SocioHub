import { useEffect, useState } from 'react'
import AnnouncementCard from '../../../components/announcements/AnnouncementCard'
import { structureApi } from '../../../services/api'
import './announcements.css'

export default function Announcements() {
  const [items, setItems] = useState([]); const [error, setError] = useState('')
  useEffect(() => { structureApi.getMyAnnouncements().then(({ announcements }) => setItems(announcements)).catch((requestError) => setError(requestError.message)) }, [])
  return <section className="resident-page"><p className="page-kicker">Stay informed</p><h1>Announcements</h1><p className="resident-intro">Updates from your society and wing.</p>{error && <p className="form-error">{error}</p>}<div className="announcement-grid">{items.map((item) => <AnnouncementCard key={item._id} announcement={item} basePath="/resident/announcements" />)}{items.length === 0 && !error && <p className="empty-state">No announcements are available.</p>}</div></section>
}
