import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AnnouncementForm from '../../../components/announcements/AnnouncementForm'
import { structureApi } from '../../../services/api'
import '../admin.css'
import './announcements.css'

export default function AnnouncementDetails() {
  const { id } = useParams(); const navigate = useNavigate(); const [item, setItem] = useState(null); const [wings, setWings] = useState([]); const [error, setError] = useState('')
  useEffect(() => { Promise.all([structureApi.getAdminAnnouncement(id), structureApi.getWings()]).then(([announcementResult, wingResult]) => { setItem(announcementResult.announcement); setWings(wingResult.wings) }).catch((requestError) => setError(requestError.message)) }, [id])
  async function save(form) { try { await structureApi.updateAnnouncement(id, form); navigate('/admin/announcements', { state: { notice: 'Announcement updated successfully.' } }) } catch (requestError) { setError(requestError.message) } }
  return <section className="admin-page"><header className="admin-header"><div><p className="page-kicker">Communication</p><h1>Edit announcement</h1></div></header>{error && <p className="form-error">{error}</p>}{item && <AnnouncementForm wings={wings} initialValue={{ ...item, wingId: item.wingId?._id || '' }} onSubmit={save} />}</section>
}
