export default function SocietyCard({ society, onEdit }) {
  return (
    <article className="structure-card">
      <div>
        <p className="card-kicker">Society</p>
        <h3>{society.name}</h3>
        <p>{society.address}</p>
      </div>
      <div className="card-meta"><span>{society.totalWings} wings</span><span>{society.totalFlats} flats</span></div>
      <button type="button" className="secondary-button" onClick={() => onEdit(society)}>Edit details</button>
    </article>
  )
}
