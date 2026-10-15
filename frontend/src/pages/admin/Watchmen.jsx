import { useEffect, useState } from 'react'
import { structureApi } from '../../services/api'
import './admin.css'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  dutyLocation: '',
}

export default function Watchmen() {
  const [watchmen, setWatchmen] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  async function loadWatchmen() {
    try {
      setLoading(true)
      setError('')

      const result = await structureApi.getWatchmen()

      setWatchmen(result.watchmen || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    structureApi.getWatchmen()
      .then((result) => { if (active) setWatchmen(result.watchmen || []) })
      .catch((requestError) => { if (active) setError(requestError.message) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    })
  }

  function editWatchman(watchman) {
    setEditingId(watchman._id)

    setForm({
      name: watchman.name || '',
      email: watchman.email || '',
      phone: watchman.phone || '',
      password: '',
      dutyLocation: watchman.dutyLocation || '',
    })
  }

  async function saveWatchman(event) {
    event.preventDefault()
    setError('')

    try {
      if (editingId) {
        await structureApi.updateWatchman(
          editingId,
          {
            name: form.name,
            email: form.email,
            phone: form.phone,
            dutyLocation: form.dutyLocation,
          }
        )
      } else {
        await structureApi.createWatchman(form)
      }

      setForm(emptyForm)
      setEditingId(null)

      await loadWatchmen()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function removeWatchman(watchman) {
    const confirmed = window.confirm(
      `Remove ${watchman.name} from the society?`
    )

    if (!confirmed) return

    try {
      setError('')

      await structureApi.deleteWatchman(
        watchman._id
      )

      await loadWatchmen()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <section className="admin-page">
      <header className="admin-header">
        <div>
          <p className="page-kicker">
            Security management
          </p>

          <h1>Watchmen</h1>

          <p>
            Manage watchman accounts and their gate or
            duty locations.
          </p>
        </div>
      </header>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div className="resident-layout">
        <form
          className="admin-form"
          onSubmit={saveWatchman}
        >
          <h2>
            {editingId
              ? 'Update watchman'
              : 'Add watchman'}
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
            Phone number
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
            Gate / Duty location
            <input
              name="dutyLocation"
              placeholder="e.g. Main Gate"
              value={form.dutyLocation}
              onChange={updateField}
            />
          </label>

          <div className="form-actions">
            <button
              className="primary-button"
              type="submit"
            >
              {editingId
                ? 'Save watchman'
                : 'Create watchman'}
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

        <div className="resident-table-wrap">
          <table className="resident-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Duty location</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {watchmen.map((watchman) => (
                <tr key={watchman._id}>
                  <td>
                    <strong>
                      {watchman.name}
                    </strong>

                    <small>
                      {watchman.email}
                    </small>
                  </td>

                  <td>
                    {watchman.phone || 'No phone'}
                  </td>

                  <td>
                    {watchman.dutyLocation ||
                      'Not specified'}
                  </td>

                  <td>
                    {watchman.isActive
                      ? 'Active'
                      : 'Inactive'}
                  </td>

                  <td>
                    <div className="table-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          editWatchman(watchman)
                        }
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="danger-button"
                        onClick={() =>
                          removeWatchman(watchman)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loading && (
            <p className="empty-state">
              Loading watchmen...
            </p>
          )}

          {!loading && watchmen.length === 0 && (
            <p className="empty-state">
              No watchmen have been added yet.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
