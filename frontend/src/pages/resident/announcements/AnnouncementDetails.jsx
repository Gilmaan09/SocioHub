import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { structureApi } from '../../../services/api'
import './announcements.css'

export default function AnnouncementDetails() {
  const { id } = useParams(); const [item, setItem] = useState(null); const [error, setError] = useState('')
  useEffect(() => { structureApi.getMyAnnouncement(id).then(({ announcement }) => setItem(announcement)).catch((requestError) => setError(requestError.message)) }, [id])
  return <section className="resident-page"><Link className="back-link" to="/resident/announcements">← Announcements</Link><p className="page-kicker">Society update</p><h1>{item?.title || 'Announcement'}</h1>{error && <p className="form-error">{error}</p>}{item && <article className="announcement-detail detail-panel"><div className="announcement-card-top"><span className={`announcement-priority ${item.priority.toLowerCase()}`}>{item.priority}</span><small>{new Date(item.publishAt).toLocaleString('en-IN')}</small></div><p>{item.description}</p>{item.wingId && <small>For Wing {item.wingId.name}</small>}{item.attachmentUrl && <a href={item.attachmentUrl} target="_blank" rel="noreferrer">Open attachment</a>}</article>}</section>
}
