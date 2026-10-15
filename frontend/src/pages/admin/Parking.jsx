import { useEffect, useState } from 'react'
import ParkingCard from '../../components/society/ParkingCard'
import { structureApi } from '../../services/api'
import './admin.css'

const emptyParking = { slotNumber: '', type: 'CAR', flatId: '', status: 'AVAILABLE', notes: '' }

export default function Parking() {
  const [parking, setParking] = useState([])
  const [flats, setFlats] = useState([])
  const [form, setForm] = useState(emptyParking)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  async function loadData() { try { const [parkingResult, flatResult] = await Promise.all([structureApi.getParking(), structureApi.getFlats()]); setParking(parkingResult.parking); setFlats(flatResult.flats) } catch (requestError) { setError(requestError.message) } }
  useEffect(() => {
    let cancelled = false
    Promise.all([structureApi.getParking(), structureApi.getFlats()]).then(([parkingResult, flatResult]) => {
      if (!cancelled) {
        setParking(parkingResult.parking)
        setFlats(flatResult.flats)
      }
    }).catch((requestError) => {
      if (!cancelled) setError(requestError.message)
    })
    return () => { cancelled = true }
  }, [])
  function updateField(event) { setForm({ ...form, [event.target.name]: event.target.value }) }
  function editParking(slot) { setEditingId(slot._id); setForm({ slotNumber: slot.slotNumber, type: slot.type, flatId: slot.flatId?._id || '', status: slot.status, notes: slot.notes || '' }) }
  async function saveParking(event) { event.preventDefault(); setError(''); const body = { ...form, flatId: form.flatId || null }; try { if (editingId) await structureApi.updateParking(editingId, body); else await structureApi.createParking(body); setForm(emptyParking); setEditingId(null); await loadData() } catch (requestError) { setError(requestError.message) } }
  async function deleteParking(slot) { if (!window.confirm(`Delete parking ${slot.slotNumber}?`)) return; try { await structureApi.deleteParking(slot._id); await loadData() } catch (requestError) { setError(requestError.message) } }

  return <section className="admin-page"><header className="admin-header"><div><p className="page-kicker">Society management</p><h1>Parking</h1><p>Track every parking slot and assign it to a registered flat.</p></div></header>{error && <p className="form-error">{error}</p>}<div className="admin-layout"><form className="admin-form" onSubmit={saveParking}><h2>{editingId ? 'Edit parking' : 'Add parking'}</h2><label>Slot number<input name="slotNumber" placeholder="P-27" value={form.slotNumber} onChange={updateField} required /></label><label>Vehicle type<select name="type" value={form.type} onChange={updateField}><option value="CAR">Car</option><option value="BIKE">Bike</option><option value="OTHER">Other</option></select></label><label>Assign to flat<select name="flatId" value={form.flatId} onChange={updateField}><option value="">Available</option>{flats.map((flat) => <option key={flat._id} value={flat._id}>{flat.number}</option>)}</select></label><label>Notes<textarea name="notes" value={form.notes} onChange={updateField} /></label><button className="primary-button" type="submit">{editingId ? 'Save parking' : 'Add parking'}</button></form><div className="card-grid">{parking.map((slot) => <ParkingCard key={slot._id} parking={slot} onEdit={editParking} onDelete={deleteParking} />)}</div></div></section>
}
