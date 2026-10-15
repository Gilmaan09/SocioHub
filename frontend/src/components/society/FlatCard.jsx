export default function FlatCard({ flat, onEdit, onDelete }) {
  return (
    <article className="structure-card compact-card">
      <div><p className="card-kicker">{flat.wingId?.name || 'Flat'}</p><h3>{flat.number}</h3><p>{flat.floor} floor · {flat.type || 'Type not set'} · {flat.area || 0} sq. ft.</p></div>
      <div className="assignment-list"><span>Owner: {flat.ownerId?.name || 'Unassigned'}</span><span>Tenant: {flat.tenantId?.name || 'None'}</span></div>
      <div className="card-actions"><button type="button" className="secondary-button" onClick={() => onEdit(flat)}>Edit</button><button type="button" className="danger-button" onClick={() => onDelete(flat)}>Delete</button></div>
    </article>
  )
}
