export default function ParkingCard({ parking, onEdit, onDelete }) {
  return (
    <article className="structure-card compact-card">
      <div><p className="card-kicker">{parking.type}</p><h3>{parking.slotNumber}</h3><p>{parking.flatId ? `Assigned to ${parking.flatId.number}` : 'Available for assignment'}</p></div>
      <span className={`status-pill ${parking.status.toLowerCase()}`}>{parking.status}</span>
      <div className="card-actions"><button type="button" className="secondary-button" onClick={() => onEdit(parking)}>Edit</button><button type="button" className="danger-button" onClick={() => onDelete(parking)}>Delete</button></div>
    </article>
  )
}
