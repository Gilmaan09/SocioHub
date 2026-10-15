import { useEffect, useState } from 'react'
import SocietyCard from '../../components/society/SocietyCard'
import { structureApi } from '../../services/api'
import './admin.css'

const defaultExternalAmenities = ['Sit Out Area', 'Security 24 x 7', 'Banquet Hall', 'Terrace Garden', 'Kids Play Area', 'Gymnasium', 'Electrical Vehicle Charging', 'Yoga', '24 x 7 Water Supply']
const defaultInternalFeatures = ['Vitrified Tiles for Living, Dining, Kitchen & Bedrooms', 'Vitrified Tiles for Bathroom Flooring & Dado', 'Wash Basin Counters', `Vitrified Tile Dado 2'0" high above Kitchen platform`, 'Kitchen platform with SS sink & Drain board']
const emptySociety = { name: '', address: '', totalWings: 0, totalFlats: 0, contactEmail: '', contactPhone: '', about: '', establishedAt: '', amenities: [], externalAmenities: defaultExternalAmenities, internalFeatures: defaultInternalFeatures, sampleFlatPhotos: [] }

export default function Society() {
  const [society, setSociety] = useState(null)
  const [form, setForm] = useState(emptySociety)
  const [error, setError] = useState('')
  const societyId = localStorage.getItem('sociohub_society_id')

  useEffect(() => {
    if (!societyId) return
    structureApi.getSociety(societyId).then(({ society: current }) => {
      setSociety(current)
      setForm(current)
    }).catch((requestError) => setError(requestError.message))
  }, [societyId])

  function updateField(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  const amenitiesText = Array.isArray(form.amenities) ? form.amenities.join(', ') : (form.amenities || '')
  const externalAmenitiesText = Array.isArray(form.externalAmenities) ? form.externalAmenities.join('\n') : (form.externalAmenities || '')
  const internalFeaturesText = Array.isArray(form.internalFeatures) ? form.internalFeatures.join('\n') : (form.internalFeatures || '')
  const sampleFlatPhotosText = Array.isArray(form.sampleFlatPhotos) ? form.sampleFlatPhotos.join('\n') : (form.sampleFlatPhotos || '')

  async function saveSociety(event) {
    event.preventDefault()
    setError('')
    try {
      const lines = (value) => value.split('\n').map((item) => item.trim()).filter(Boolean)
      const payload = { ...form, amenities: amenitiesText.split(',').map((item) => item.trim()).filter(Boolean), externalAmenities: lines(externalAmenitiesText), internalFeatures: lines(internalFeaturesText), sampleFlatPhotos: lines(sampleFlatPhotosText), establishedAt: form.establishedAt || null }
      const result = society ? await structureApi.updateSociety(society._id, payload) : await structureApi.createSociety(payload)
      setSociety(result.society)
      setForm(result.society)
      localStorage.setItem('sociohub_society_id', result.society._id)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return <section className="admin-page"><header className="admin-header"><div><p className="page-kicker">Society management</p><h1>Society details</h1><p>Set up the information residents will see about their community.</p></div></header>{error && <p className="form-error">{error}</p>}<div className="admin-layout"><form className="admin-form" onSubmit={saveSociety}><h2>{society ? 'Edit society' : 'Create your society'}</h2><label>Society name<input name="name" value={form.name} onChange={updateField} required /></label><label>Address<textarea name="address" value={form.address} onChange={updateField} required /></label><label>About your society<textarea name="about" value={form.about || ''} onChange={updateField} maxLength="3000" placeholder="Share the story and community life of your society." /></label><label>Established date<input name="establishedAt" type="date" value={form.establishedAt ? new Date(form.establishedAt).toISOString().slice(0, 10) : ''} onChange={updateField} /></label><label>Amenities <small>Separate each amenity with a comma.</small><textarea name="amenities" value={amenitiesText} onChange={updateField} placeholder="Clubhouse, pool, gym, gardens" /></label><label>External Amenities <small>One amenity per line.</small><textarea value={externalAmenitiesText} onChange={(event) => setForm({ ...form, externalAmenities: event.target.value.split(String.fromCharCode(10)) })} rows="7" /></label><label>Internal Features <small>One feature per line.</small><textarea value={internalFeaturesText} onChange={(event) => setForm({ ...form, internalFeatures: event.target.value.split(String.fromCharCode(10)) })} rows="5" /></label><label>Sample Flat Photos <small>Paste one photo URL per line.</small><textarea value={sampleFlatPhotosText} onChange={(event) => setForm({ ...form, sampleFlatPhotos: event.target.value.split(String.fromCharCode(10)) })} rows="4" placeholder="https://example.com/flat-photo.jpg" /></label><div className="form-row"><label>Total wings<input name="totalWings" type="number" min="0" value={form.totalWings} onChange={updateField} /></label><label>Total flats<input name="totalFlats" type="number" min="0" value={form.totalFlats} onChange={updateField} /></label></div><div className="form-row"><label>Contact email<input name="contactEmail" type="email" value={form.contactEmail || ''} onChange={updateField} /></label><label>Contact phone<input name="contactPhone" value={form.contactPhone || ''} onChange={updateField} /></label></div><button className="primary-button" type="submit">{society ? 'Save changes' : 'Create society'}</button></form>{society && <SocietyCard society={society} onEdit={() => setForm(society)} />}</div></section>
}
