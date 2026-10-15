import { useEffect, useState } from 'react'
import FlatCard from '../../components/society/FlatCard'
import { structureApi } from '../../services/api'
import './admin.css'

const emptyFlat = {
  wingId: '',
  number: '',
  floor: 0,
  type: '',
  area: '',
  parkingIds: []
}

export default function Flats() {
  const [flats, setFlats] = useState([])
  const [wings, setWings] = useState([])
  const [form, setForm] = useState(emptyFlat)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')

  async function loadData() {
    try {
      const [flatResult, wingResult] = await Promise.all([
        structureApi.getFlats(),
        structureApi.getWings()
      ])

      setFlats(flatResult.flats)
      setWings(wingResult.wings)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  useEffect(() => {
    let cancelled = false

    Promise.all([
      structureApi.getFlats(),
      structureApi.getWings()
    ])
      .then(([flatResult, wingResult]) => {
        if (!cancelled) {
          setFlats(flatResult.flats)
          setWings(wingResult.wings)
        }
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(requestError.message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    })
  }

  function editFlat(flat) {
    setEditingId(flat._id)

    setForm({
      wingId: flat.wingId?._id || '',
      number: flat.number,
      floor: flat.floor,
      type: flat.type || '',
      area: flat.area || '',
      parkingIds:
        flat.parkingIds?.map(
          (parking) => parking._id || parking
        ) || []
    })
  }

  async function saveFlat(event) {
    event.preventDefault()
    setError('')

    const body = {
      wingId: form.wingId,
      number: form.number,
      floor: Number(form.floor),
      type: form.type,
      area: form.area ? Number(form.area) : undefined,
      parkingIds: form.parkingIds
    }

    try {
      if (editingId) {
        await structureApi.updateFlat(editingId, body)
      } else {
        await structureApi.createFlat(body)
      }

      setForm(emptyFlat)
      setEditingId(null)

      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function deleteFlat(flat) {
    if (!window.confirm(`Delete flat ${flat.number}?`)) {
      return
    }

    try {
      await structureApi.deleteFlat(flat._id)
      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section className="admin-page">

      <header className="admin-header">
        <div>
          <p className="page-kicker">
            Society management
          </p>

          <h1>Flats</h1>

          <p>
            Set up homes and connect them to their wing.
            Residents can be assigned separately.
          </p>
        </div>
      </header>


      {error && (
        <p className="form-error">
          {error}
        </p>
      )}


      <div className="admin-layout">

        <form
          className="admin-form"
          onSubmit={saveFlat}
        >

          <h2>
            {editingId ? 'Edit flat' : 'Add a flat'}
          </h2>


          {/* WING */}

          <label>
            Wing

            <select
              name="wingId"
              value={form.wingId}
              onChange={updateField}
              required
            >
              <option value="">
                Select wing
              </option>

              {wings.map((wing) => (
                <option
                  key={wing._id}
                  value={wing._id}
                >
                  {wing.name}
                </option>
              ))}
            </select>
          </label>


          {/* FLAT NUMBER + FLOOR */}

          <div className="form-row">

            <label>
              Flat number

              <input
                name="number"
                placeholder="A-504"
                value={form.number}
                onChange={updateField}
                required
              />
            </label>


            <label>
              Floor

              <input
                name="floor"
                type="number"
                min="0"
                value={form.floor}
                onChange={updateField}
                required
              />
            </label>

          </div>


          {/* TYPE + AREA */}

          <div className="form-row">

            <label>
              Type

              <input
                name="type"
                placeholder="2 BHK"
                value={form.type}
                onChange={updateField}
              />
            </label>


            <label>
              Area

              <input
                name="area"
                type="number"
                min="0"
                placeholder="950"
                value={form.area}
                onChange={updateField}
              />
            </label>

          </div>


          {/* NOTE */}

          <div className="form-info">
            <strong>Resident assignment</strong>

            <p>
              Owners and tenants are assigned to this flat
              from the Residents section after their accounts
              are created.
            </p>
          </div>


          <div className="form-actions">

            <button
              className="primary-button"
              type="submit"
            >
              {editingId ? 'Save flat' : 'Add flat'}
            </button>


            {editingId && (
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyFlat)
                }}
              >
                Cancel
              </button>
            )}

          </div>

        </form>


        {/* FLAT CARDS */}

        <div className="card-grid">

          {flats.map((flat) => (
            <FlatCard
              key={flat._id}
              flat={flat}
              onEdit={editFlat}
              onDelete={deleteFlat}
            />
          ))}

        </div>

      </div>

    </section>
  )
}