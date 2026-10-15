import { useEffect, useState } from 'react'
import { structureApi } from '../../services/api'
import './admin.css'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'OWNER',
  flatId: ''
}

function confirmFlatReplacement(flatLabel, assignedResidents, replacementName) {
  const currentAssignments = assignedResidents
    .map((resident) => `${resident.name} (${resident.role.toLowerCase()})`)
    .join(', ')
  const assignmentPhrase = assignedResidents.length === 1 ? 'this assignment' : 'these assignments'
  return window.confirm(
    `${flatLabel} is already assigned to ${currentAssignments}. Replace ${assignmentPhrase} with ${replacementName}? The current resident${assignedResidents.length > 1 ? 's' : ''} will become unassigned.`,
  )
}

export default function Residents() {
  const [residents, setResidents] = useState([])
  const [wings, setWings] = useState([])
  const [flats, setFlats] = useState([])

  const [filters, setFilters] = useState({
    search: '',
    role: '',
    wingId: ''
  })

  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const assignedResidents = residents.filter((resident) => resident.flatId)

  async function loadResidents(nextFilters = filters) {
    try {
      const query = new URLSearchParams(
        Object.entries(nextFilters).filter(([, value]) => value)
      ).toString()

      const result = await structureApi.getResidents(query)

      setResidents(result.residents)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function loadFlats() {
    try {
      const result = await structureApi.getFlats()

      setFlats(result.flats)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  useEffect(() => {
    let cancelled = false

    Promise.all([
      structureApi.getResidents(),
      structureApi.getWings(),
      structureApi.getFlats()
    ])
      .then(([residentResult, wingResult, flatResult]) => {
        if (!cancelled) {
          setResidents(residentResult.residents)
          setWings(wingResult.wings)
          setFlats(flatResult.flats)
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

  function updateFilter(event) {
    const next = {
      ...filters,
      [event.target.name]: event.target.value
    }

    setFilters(next)
    loadResidents(next)
  }

  function editResident(resident) {
    setEditingId(resident._id)

    setForm({
      name: resident.name,
      email: resident.email,
      phone: resident.phone || '',
      password: '',
      role: resident.role,
      flatId: resident.flatId?._id || ''
    })
  }

  async function saveResident(event) {
    event.preventDefault()
    setError('')

    async function submitResident(replaceAssignmentOf) {
      if (editingId) {
        await structureApi.updateResident(editingId, {
          name: form.name,
          email: form.email,
          phone: form.phone,
          flatId: form.flatId || null,
          replaceAssignmentOf
        })
      } else {
        await structureApi.createResident({ ...form, replaceAssignmentOf })
      }
    }

    try {
      let replaceAssignmentOf
      if (form.flatId) {
        const { residents: allResidents } = await structureApi.getResidents()
        const currentOccupants = allResidents.filter((resident) =>
          resident._id !== editingId &&
          resident.role === form.role &&
          resident.flatId?._id === form.flatId,
        )
        if (currentOccupants.length) {
          const selectedFlat = flats.find((flat) => flat._id === form.flatId)
          if (!confirmFlatReplacement(getFlatLabel(selectedFlat || {}), currentOccupants, form.name)) {
            setError('No changes made. The existing flat assignment was kept.')
            return
          }
          replaceAssignmentOf = currentOccupants.map((resident) => resident._id)
        }
      }

      await submitResident(replaceAssignmentOf)

      setForm(emptyForm)
      setEditingId(null)

      await loadResidents()
      await loadFlats()
    } catch (requestError) {
      if (requestError.code === 'FLAT_ALREADY_ASSIGNED' && (requestError.assignedResidents?.length || requestError.assignedResident)) {
        const assignedResidents = requestError.assignedResidents?.length
          ? requestError.assignedResidents
          : [requestError.assignedResident]
        const confirmed = confirmFlatReplacement(requestError.flatLabel, assignedResidents, form.name)
        if (!confirmed) {
          setError(`No changes made. ${requestError.message}`)
          return
        }

        try {
          await submitResident(assignedResidents.map((resident) => resident.id))
          setForm(emptyForm)
          setEditingId(null)
          await loadResidents()
          await loadFlats()
          return
        } catch (retryError) {
          setError(retryError.message)
          return
        }
      }
      setError(requestError.message)
    }
  }

  async function removeAssignment(resident) {
    try {
      await structureApi.removeResidentAssignment(resident._id)

      await loadResidents()
      await loadFlats()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  function getFlatLabel(flat) {
    const wingName = flat.wingId?.name || ''

    return `${wingName ? wingName + ' - ' : ''}${flat.number || flat.flatNumber}`
  }

  return (
    <section className="admin-page">

      <header className="admin-header">
        <div>
          <p className="page-kicker">Society management</p>

          <h1>Residents</h1>

          <p>
            Manage owner and tenant accounts and connect them to their homes.
          </p>
        </div>
      </header>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div className="resident-toolbar">

        <input
          name="search"
          placeholder="Search by name, email or phone"
          value={filters.search}
          onChange={updateFilter}
        />

        <select
          name="role"
          value={filters.role}
          onChange={updateFilter}
        >
          <option value="">All residents</option>
          <option value="OWNER">Owners</option>
          <option value="TENANT">Tenants</option>
        </select>

        <select
          name="wingId"
          value={filters.wingId}
          onChange={updateFilter}
        >
          <option value="">All wings</option>

          {wings.map((wing) => (
            <option key={wing._id} value={wing._id}>
              {wing.name}
            </option>
          ))}
        </select>

      </div>


      <div className="resident-layout">

        {/* ========================= */}
        {/* ADD / EDIT RESIDENT */}
        {/* ========================= */}

        <form
          className="admin-form"
          onSubmit={saveResident}
        >

          <h2>
            {editingId ? 'Update resident' : 'Add resident'}
          </h2>


          <label>
            Name

            <input
              name="name"
              value={form.name}
              onChange={updateField}
              required
            />
          </label>


          <label>
            Email

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </label>


          <label>
            Phone

            <input
              name="phone"
              value={form.phone}
              onChange={updateField}
            />
          </label>


          {!editingId && (
            <label>
              Temporary password

              <input
                name="password"
                type="password"
                value={form.password}
                onChange={updateField}
                minLength="6"
                required
              />
            </label>
          )}


          <label>
            Role

            <select
              name="role"
              value={form.role}
              onChange={updateField}
              disabled={Boolean(editingId)}
            >
              <option value="OWNER">
                Owner
              </option>

              <option value="TENANT">
                Tenant
              </option>
            </select>
          </label>


          {/* ========================= */}
          {/* FLAT DROPDOWN */}
          {/* ========================= */}

          <label>
            Flat

            <select
              name="flatId"
              value={form.flatId}
              onChange={updateField}
            >

              <option value="">
                Select flat
              </option>

              {flats.map((flat) => (
                <option
                  key={flat._id}
                  value={flat._id}
                >
                  {getFlatLabel(flat)}
                </option>
              ))}

            </select>

          </label>


          <div className="form-actions">

            <button
              className="primary-button"
              type="submit"
            >
              {editingId
                ? 'Save resident'
                : 'Create resident'}
            </button>


            {editingId && (
              <button
                className="secondary-button"
                type="button"
                onClick={() => {
                  setEditingId(null)
                  setForm(emptyForm)
                }}
              >
                Cancel
              </button>
            )}

          </div>

        </form>


        {/* ========================= */}
        {/* RESIDENT TABLE */}
        {/* ========================= */}

        <div className="resident-table-wrap">

          <table className="resident-table">

            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Flat</th>
                <th>Contact</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>


            <tbody>

              {assignedResidents.map((resident) => (

                <tr key={resident._id}>

                  <td>
                    <strong>
                      {resident.name}
                    </strong>

                    <small>
                      {resident.email}
                    </small>
                  </td>


                  <td>
                    <span
                      className={`role-pill ${resident.role.toLowerCase()}`}
                    >
                      {resident.role}
                    </span>
                  </td>


                  <td>
                    {resident.flatId
                      ? getFlatLabel(resident.flatId)
                      : 'Unassigned'}
                  </td>


                  <td>
                    {resident.phone || 'No phone'}
                  </td>


                  <td>
                    {resident.isActive
                      ? 'Active'
                      : 'Inactive'}
                  </td>


                  <td>

                    <div className="table-actions">

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          editResident(resident)
                        }
                      >
                        Edit
                      </button>


                      {resident.flatId && (
                        <button
                          type="button"
                          className="danger-button"
                          onClick={() =>
                            removeAssignment(resident)
                          }
                        >
                          Remove flat
                        </button>
                      )}

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>


          {assignedResidents.length === 0 && (
            <p className="empty-state">
              No assigned residents match these filters.
            </p>
          )}

        </div>

      </div>

    </section>
  )
}
