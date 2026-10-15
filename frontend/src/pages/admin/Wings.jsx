import { useEffect, useState } from 'react'
import WingCard from '../../components/society/WingCard'
import { structureApi } from '../../services/api'
import './admin.css'

const emptyWing = { name: '', totalFloors: 0, description: '' }

export default function Wings() {
  const [wings, setWings] = useState([])
  const [form, setForm] = useState(emptyWing)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  async function loadWings() { try { setWings((await structureApi.getWings()).wings) } catch (requestError) { setError(requestError.message) } }
  useEffect(() => {
    let cancelled = false
    structureApi.getWings().then(({ wings }) => {
      if (!cancelled) setWings(wings)
    }).catch((requestError) => {
      if (!cancelled) setError(requestError.message)
    })
    return () => { cancelled = true }
  }, [])
  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  function editWing(wing) { setEditingId(wing._id); setForm({ name: wing.name, totalFloors: wing.totalFloors, description: wing.description || '' }) }
  async function saveWing(event) { event.preventDefault(); setError(''); try { if (editingId) await structureApi.updateWing(editingId, form); else await structureApi.createWing(form); setForm(emptyWing); setEditingId(null); await loadWings() } catch (requestError) { setError(requestError.message) } }
  async function deleteWing(wing) { if (!window.confirm(`Delete ${wing.name}?`)) return; try { await structureApi.deleteWing(wing._id); await loadWings() } catch (requestError) { setError(requestError.message) } }

  return <section className="admin-page"><header className="admin-header"><div><p className="page-kicker">Society management</p><h1>Wings</h1><p>Create and maintain the buildings that make up your society.</p></div></header>{error && <p className="form-error">{error}</p>}<div className="admin-layout"><form className="admin-form" onSubmit={saveWing}><h2>{editingId ? 'Edit wing' : 'Add a wing'}</h2><label>Wing name<input name="name" placeholder="Wing A" value={form.name} onChange={updateField} required /></label><label>Total floors<input name="totalFloors" type="number" min="0" value={form.totalFloors} onChange={updateField} /></label><label>Description<textarea name="description" value={form.description} onChange={updateField} /></label><div className="form-actions"><button className="primary-button" type="submit">{editingId ? 'Save wing' : 'Add wing'}</button>{editingId && <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(emptyWing) }}>Cancel</button>}</div></form><div className="card-grid">{wings.map((wing) => <WingCard key={wing._id} wing={wing} onEdit={editWing} onDelete={deleteWing} />)}</div></div></section>
}
