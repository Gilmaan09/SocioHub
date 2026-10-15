import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { structureApi } from '../../../services/api'
import '../admin.css'
import './complaints.css'

export default function Complaints() {
  const [complaints, setComplaints] = useState([]); const [error, setError] = useState('')
  useEffect(() => { structureApi.getAdminComplaints().then(({ complaints: items }) => setComplaints(items)).catch((requestError) => setError(requestError.message)) }, [])
  return <section className="admin-page"><header className="admin-header"><div><p className="page-kicker">Operations</p><h1>Complaints</h1><p>Review and manage issues raised by residents.</p></div></header>{error && <p className="form-error">{error}</p>}<div className="admin-complaint-table">{complaints.map((complaint) => <Link className="admin-complaint-row" to={`/admin/complaints/${complaint._id}`} key={complaint._id}><span>{complaint.complaintNumber}</span><strong>{complaint.title}</strong><span>{complaint.flatId?.wingId?.name}-{complaint.flatId?.number}</span><span className={`priority ${complaint.priority.toLowerCase()}`}>{complaint.priority}</span><span className={`complaint-status ${complaint.status.toLowerCase()}`}>{complaint.status.replace('_', ' ')}</span></Link>)}{complaints.length === 0 && !error && <p className="empty-state">No complaints found.</p>}</div></section>
}
