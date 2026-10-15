import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { structureApi } from '../../../services/api'
import './complaints.css'

const stages = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
export default function ComplaintDetails() {
  const { id } = useParams(); const [complaint, setComplaint] = useState(null); const [error, setError] = useState('')
  useEffect(() => { structureApi.getMyComplaint(id).then(({ complaint: item }) => setComplaint(item)).catch((requestError) => setError(requestError.message)) }, [id])
  const currentStage = complaint ? stages.indexOf(complaint.status) : 0
  return <section className="resident-page"><Link className="back-link" to="/resident/complaints">← My complaints</Link><p className="page-kicker">Complaint tracking</p><h1>{complaint?.title || 'Complaint details'}</h1>{error && <p className="form-error">{error}</p>}{complaint && <div className="detail-panel complaint-detail"><div className="complaint-detail-top"><span>{complaint.complaintNumber} · {complaint.category}</span><span className={`complaint-status ${complaint.status.toLowerCase()}`}>{complaint.status.replace('_', ' ')}</span></div><p>{complaint.description}</p><div className="complaint-stage">{stages.map((stage, index) => <div className={index <= currentStage ? 'complete' : ''} key={stage}><span>{index + 1}</span><small>{stage.replace('_', ' ')}</small></div>)}</div>{complaint.adminResponse && <div className="admin-response"><strong>Admin response</strong><p>{complaint.adminResponse}</p></div>}</div>}</section>
}
