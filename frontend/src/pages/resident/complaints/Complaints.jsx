import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { structureApi } from '../../../services/api'
import './complaints.css'

const pretty = (value = '') => value.toLowerCase().replaceAll('_', ' ').replace(/^\w/, (letter) => letter.toUpperCase())

export default function Complaints() {
  const [complaints, setComplaints] = useState([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('ALL')
  useEffect(() => { structureApi.getMyComplaints().then(({ complaints: items }) => setComplaints(items)).catch((requestError) => setError(requestError.message)) }, [])
  const openCount = useMemo(() => complaints.filter((item) => !['RESOLVED', 'CLOSED'].includes(item.status)).length, [complaints])
  const resolvedCount = complaints.length - openCount
  const visible = filter === 'ALL' ? complaints : complaints.filter((item) => filter === 'OPEN' ? !['RESOLVED', 'CLOSED'].includes(item.status) : ['RESOLVED', 'CLOSED'].includes(item.status))
  return <section className="resident-page complaint-hub">
    <header className="complaint-hero"><div><p className="page-kicker">RESIDENT CARE</p><h1>We’re here to help.</h1><p>Raise a concern and follow every update from your society team in one place.</p></div><Link className="complaint-new-button" to="/resident/complaints/new"><span>＋</span> Raise a complaint</Link></header>
    <div className="complaint-summary"><article><span className="complaint-summary-icon">▤</span><div><strong>{complaints.length}</strong><small>Total requests</small></div></article><article><span className="complaint-summary-icon active-icon">◷</span><div><strong>{openCount}</strong><small>In progress</small></div></article><article><span className="complaint-summary-icon done-icon">✓</span><div><strong>{resolvedCount}</strong><small>Resolved</small></div></article></div>
    <div className="complaint-list-panel"><div className="complaint-list-toolbar"><div><h2>Your requests</h2><p>Track progress and responses from management.</p></div><div className="complaint-filters" aria-label="Filter complaints">{[['ALL','All'],['OPEN','In progress'],['RESOLVED','Resolved']].map(([key,label]) => <button type="button" className={filter === key ? 'selected' : ''} onClick={() => setFilter(key)} key={key}>{label}</button>)}</div></div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {visible.length ? <div className="complaint-list">{visible.map((complaint) => <Link className="complaint-row" to={`/resident/complaints/${complaint._id}`} key={complaint._id}><span className="complaint-row-symbol">{complaint.category === 'PLUMBING' ? '⌁' : complaint.category === 'ELECTRICAL' ? 'ϟ' : '✳'}</span><div className="complaint-row-main"><div className="complaint-row-title"><strong>{complaint.title}</strong><span className={`complaint-status ${complaint.status.toLowerCase()}`}>{pretty(complaint.status)}</span></div><p>{complaint.description}</p><small><span>{complaint.complaintNumber}</span><i>·</i><span>{pretty(complaint.category)}</span><i>·</i><span>Submitted {new Date(complaint.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span></small></div><span className="complaint-row-arrow" aria-hidden="true">→</span></Link>)}</div> : <div className="complaint-empty"><span>✦</span><h3>{complaints.length ? 'Nothing in this view' : 'Your home, taken care of.'}</h3><p>{complaints.length ? 'Try another filter to see your requests.' : 'When something needs attention, let your society team know and track the update here.'}</p>{!complaints.length && <Link to="/resident/complaints/new">Create your first request <span>→</span></Link>}</div>}
    </div>
  </section>
}
