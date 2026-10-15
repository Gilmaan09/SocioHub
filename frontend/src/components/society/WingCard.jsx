export default function WingCard({ wing, onEdit, onDelete }) {
  return (
    <article className="structure-card compact-card">
      <div><p className="card-kicker">Wing</p><h3>{wing.name}</h3><p>{wing.totalFloors || 0} floors</p></div>
      <div className="card-actions"><button type="button" className="secondary-button" onClick={() => onEdit(wing)}>Edit</button><button type="button" className="danger-button" onClick={() => onDelete(wing)}>Delete</button></div>
    </article>
  )
}
