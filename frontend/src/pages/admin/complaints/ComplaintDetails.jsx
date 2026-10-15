import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { structureApi } from '../../../services/api'
import '../admin.css'
import './complaints.css'

export default function ComplaintDetails() {
  const { id } = useParams(); const [complaint, setComplaint] = useState(null); const [error, setError] = useState(''); const [form, setForm] = useState({ status: '', priority: '', adminResponse: '' })
  useEffect(() => { structureApi.getAdminComplaints().then(({ complaints }) => { const item = complaints.find((entry) => entry._id === id); if (!item) throw new Error('Complaint not found'); setComplaint(item); setForm({ status: item.status, priority: item.priority, adminResponse: item.adminResponse || '' }) }).catch((requestError) => setError(requestError.message)) }, [id])
  async function save(event) { event.preventDefault(); try { const result = await structureApi.updateComplaint(id, form); setComplaint(result.complaint); setError('') } catch (requestError) { setError(requestError.message) } }
  return <section className="admin-page"><header className="admin-header"><div><p className="page-kicker">Operations</p><h1>{complaint?.title || 'Complaint details'}</h1><p>{complaint?.complaintNumber} · {complaint?.flatId?.wingId?.name}-{complaint?.flatId?.number}</p></div></header>{error && <p className="form-error">{error}</p>}{complaint && <form className="admin-form complaint-admin-form" onSubmit={save}><p>{complaint.description}</p><label>Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>{['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => <option key={status}>{status}</option>)}</select></label><label>Priority<select value={form.priority} onChange={(event) => setForm({ ...form, priority: event.target.value })}>{['LOW', 'MEDIUM', 'HIGH', 'URGENT'].map((priority) => <option key={priority}>{priority}</option>)}</select></label><label>Admin response<textarea value={form.adminResponse} onChange={(event) => setForm({ ...form, adminResponse: event.target.value })} /></label><button className="primary-button" type="submit">Save complaint</button></form>}</section>
}
