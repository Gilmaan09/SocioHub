import { useEffect, useState } from 'react'
import {
  structureApi,
  visitorApi,
} from '../../services/api'
import './watchman.css'

export default function Visitors() {
  const [flats, setFlats] = useState([])
  const [visitors, setVisitors] = useState([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [processingId, setProcessingId] =
    useState(null)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    visitorName: '',
    phone: '',
    flatId: '',
    purpose: '',
    vehicleNumber: '',
    visitorCount: 1,
  })


  useEffect(() => {
    loadData()
  }, [])


  async function loadData() {
    try {
      setLoading(true)
      setError('')

      const [
        flatResult,
        visitorResult,
      ] = await Promise.all([
        structureApi.getFlats(),
        visitorApi.getTodayVisitors(),
      ])

      setFlats(flatResult.flats || [])
      setVisitors(
        visitorResult.visitors || []
      )
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }


  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    })
  }


  async function handleSubmit(event) {
    event.preventDefault()

    setMessage('')
    setError('')

    try {
      setSaving(true)

      const result =
        await visitorApi.createVisitor(form)

      setMessage(
        result.message ||
          'Visitor registered successfully'
      )

      setForm({
        visitorName: '',
        phone: '',
        flatId: '',
        purpose: '',
        vehicleNumber: '',
        visitorCount: 1,
      })

      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }


  async function handleEntry(id) {
    try {
      setProcessingId(id)
      setMessage('')
      setError('')

      const result =
        await visitorApi.markVisitorEntry(id)

      setMessage(
        result.message ||
          'Visitor entry recorded successfully'
      )

      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setProcessingId(null)
    }
  }


  async function handleExit(id) {
    try {
      setProcessingId(id)
      setMessage('')
      setError('')

      const result =
        await visitorApi.markVisitorExit(id)

      setMessage(
        result.message ||
          'Visitor exit recorded successfully'
      )

      await loadData()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setProcessingId(null)
    }
  }


  function formatDate(date) {
    if (!date) return '-'

    return new Date(
      date
    ).toLocaleString()
  }


  function getStatusClass(status) {
    return `visitor-status ${status.toLowerCase()}`
  }


  return (
    <section className="watchman-visitors">

      <p className="page-kicker">
        Visitor management
      </p>

      <h1>Visitors</h1>

      <p className="watchman-intro">
        Register visitors and manage today's
        society entries.
      </p>


      {message && (
        <p className="form-success">
          {message}
        </p>
      )}


      {error && (
        <p className="form-error">
          {error}
        </p>
      )}


      {/* REGISTER VISITOR */}

      <section className="watchman-profile-panel">

        <h2>Register Visitor</h2>

        <form
          className="watchman-password-form"
          onSubmit={handleSubmit}
        >

          <label>
            Visitor Name

            <input
              name="visitorName"
              value={form.visitorName}
              onChange={updateField}
              placeholder="Enter visitor name"
              required
            />
          </label>


          <label>
            Phone

            <input
              name="phone"
              value={form.phone}
              onChange={updateField}
              placeholder="Enter phone number"
            />
          </label>


          <label>
            Visiting Flat

            <select
              name="flatId"
              value={form.flatId}
              onChange={updateField}
              required
            >

              <option value="">
                Select flat
              </option>

              {flats.map((flat) => (
                <option
                  key={flat._id}
                  value={flat._id}
                >
                  {flat.number}
                </option>
              ))}

            </select>
          </label>


          <label>
            Purpose

            <input
              name="purpose"
              value={form.purpose}
              onChange={updateField}
              placeholder="Example: Visiting resident"
              required
            />
          </label>


          <label>
            Vehicle Number
            <span>
              (Optional)
            </span>

            <input
              name="vehicleNumber"
              value={form.vehicleNumber}
              onChange={updateField}
              placeholder="Example: MH12AB1234"
            />
          </label>


          <label>
            Number of Visitors

            <input
              name="visitorCount"
              type="number"
              min="1"
              value={form.visitorCount}
              onChange={updateField}
              required
            />
          </label>


          <button
            type="submit"
            className="primary-button"
            disabled={saving}
          >
            {saving
              ? 'Registering...'
              : 'Register Visitor'}
          </button>

        </form>

      </section>


      {/* TODAY'S VISITORS */}

      <section className="watchman-profile-panel">

        <div className="watchman-section-header">

          <div>

            <h2>
              Today's Visitors
            </h2>

            <p>
              Visitors registered at the
              gate today.
            </p>

          </div>


          <button
            type="button"
            className="secondary-button"
            onClick={loadData}
          >
            Refresh
          </button>

        </div>


        {loading ? (

          <p>
            Loading visitors...
          </p>

        ) : visitors.length === 0 ? (

          <div className="watchman-empty-state">

            <strong>
              No visitors registered today
            </strong>

            <span>
              Registered visitors will
              appear here.
            </span>

          </div>

        ) : (

          <div className="watchman-visitor-list">

            {visitors.map((visitor) => (

              <article
                className="watchman-visitor-card"
                key={visitor._id}
              >

                <div className="visitor-main">

                  <h3>
                    {visitor.visitorName}
                  </h3>

                  <p>
                    Flat:{' '}
                    {visitor.flatId?.number ||
                      'Unknown'}
                  </p>

                  <p>
                    Purpose:{' '}
                    {visitor.purpose}
                  </p>

                  {visitor.phone && (
                    <p>
                      Phone:{' '}
                      {visitor.phone}
                    </p>
                  )}

                  {visitor.vehicleNumber && (
                    <p>
                      Vehicle:{' '}
                      {visitor.vehicleNumber}
                    </p>
                  )}

                  <small>
                    Request time:{' '}
                    {formatDate(
                      visitor.entryTime
                    )}
                  </small>

                </div>


                <div className="visitor-side">

                  <span
                    className={getStatusClass(
                      visitor.status
                    )}
                  >
                    {visitor.status}
                  </span>


                  <span>
                    {visitor.visitorCount}{' '}
                    visitor
                    {visitor.visitorCount !==
                    1
                      ? 's'
                      : ''}
                  </span>


                  {/* APPROVED → MARK ENTRY */}

                  {visitor.status ===
                    'APPROVED' && (

                    <button
                      type="button"
                      className="approve-button"
                      disabled={
                        processingId ===
                        visitor._id
                      }
                      onClick={() =>
                        handleEntry(
                          visitor._id
                        )
                      }
                    >
                      {processingId ===
                      visitor._id
                        ? 'Processing...'
                        : 'Mark Entry'}
                    </button>

                  )}


                  {/* INSIDE → MARK EXIT */}

                  {visitor.status ===
                    'INSIDE' && (

                    <button
                      type="button"
                      className="reject-button"
                      disabled={
                        processingId ===
                        visitor._id
                      }
                      onClick={() =>
                        handleExit(
                          visitor._id
                        )
                      }
                    >
                      {processingId ===
                      visitor._id
                        ? 'Processing...'
                        : 'Mark Exit'}
                    </button>

                  )}

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </section>
  )
}