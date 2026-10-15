import { useEffect, useState } from 'react'
import { structureApi } from '../../services/api'
import './resident.css'

export default function MyParking() {
  const [flat, setFlat] = useState(null)
  const [error, setError] = useState('')
  useEffect(() => { structureApi.getMyFlat().then(({ flat: currentFlat }) => setFlat(currentFlat)).catch((requestError) => setError(requestError.message)) }, [])
  return <section className="resident-page"><p className="page-kicker">Your property</p><h1>My parking</h1>{error && <p className="form-error">{error}</p>}<div className="parking-list">{flat?.parkingIds?.length ? flat.parkingIds.map((parking) => <article className="detail-panel" key={parking._id}><strong>{parking.slotNumber}</strong><span>{parking.type} · {parking.status}</span><p>Assigned to {flat.wingId?.name}-{flat.number}</p></article>) : <p className="empty-state">No parking slot has been assigned to your flat.</p>}</div></section>
}
