import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnnouncementForm from '../../../components/announcements/AnnouncementForm'
import { structureApi } from '../../../services/api'
import '../admin.css'
import './announcements.css'

export default function CreateAnnouncement() {
  const navigate = useNavigate(); const [wings, setWings] = useState([]); const [error, setError] = useState('')
  useEffect(() => { structureApi.getWings().then(({ wings: items }) => setWings(items)).catch((requestError) => setError(requestError.message)) }, [])
  async function submit(form) { try { await structureApi.createAnnouncement(form); navigate('/admin/announcements', { state: { notice: 'Announcement published successfully.' } }) } catch (requestError) { setError(requestError.message) } }
  return <section className="admin-page"><header className="admin-header"><div><p className="page-kicker">Communication</p><h1>Create announcement</h1></div></header>{error && <p className="form-error">{error}</p>}<AnnouncementForm wings={wings} onSubmit={submit} /></section>
}
