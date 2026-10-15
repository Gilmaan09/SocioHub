import { Link } from 'react-router-dom'

export default function AnnouncementCard({ announcement, basePath, onDelete }) {
  return <article className="announcement-card"><div className="announcement-card-top"><span className={`announcement-priority ${announcement.priority.toLowerCase()}`}>{announcement.priority === 'IMPORTANT' ? 'Important' : 'Notice'}</span><small>{new Date(announcement.publishAt).toLocaleDateString('en-IN')}</small></div><h3>{announcement.title}</h3><p>{announcement.description}</p><small>{announcement.wingId ? `Wing ${announcement.wingId.name}` : 'Entire society'}</small><div className="announcement-card-actions"><Link to={`${basePath}/${announcement._id}`}>View details</Link>{onDelete && <button type="button" onClick={() => onDelete(announcement)}>Delete</button>}</div></article>
}
