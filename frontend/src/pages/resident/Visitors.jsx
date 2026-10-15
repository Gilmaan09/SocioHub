import { useEffect, useState } from 'react'
import { visitorApi } from '../../services/api'
import './visitors.css'

export default function Visitors() {
  const [visitors, setVisitors] = useState([])
  const [loading, setLoading] = useState(true)

  const [processingId, setProcessingId] =
    useState(null)

  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadVisitors()
  }, [])

  async function loadVisitors() {
    try {
      setLoading(true)
      setError('')

      const result =
        await visitorApi.getMyFlatVisitors()

      setVisitors(result.visitors || [])
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id) {
    try {
      setProcessingId(id)
      setError('')
      setMessage('')

      const result =
        await visitorApi.approveVisitor(id)

      setMessage(
        result.message ||
          'Visitor approved successfully'
      )

      await loadVisitors()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setProcessingId(null)
    }
  }

  async function handleReject(id) {
    try {
      setProcessingId(id)
      setError('')
      setMessage('')

      const result =
        await visitorApi.rejectVisitor(id)

      setMessage(
        result.message ||
          'Visitor rejected successfully'
      )

      await loadVisitors()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setProcessingId(null)
    }
  }

  function formatDate(date) {
    if (!date) return '-'

    return new Date(date).toLocaleString()
  }

  function getStatusClass(status) {
    return `resident-visitor-status ${status.toLowerCase()}`
  }

  return (
    <section className="resident-visitors">

      <p className="page-kicker">
        Visitor management
      </p>

      <h1>Visitors</h1>

      <p className="resident-visitors-intro">
        View visitors registered for your flat
        and approve or reject pending requests.
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


      <section className="resident-visitors-panel">

        <div className="resident-visitors-header">

          <div>
            <h2>
              Visitor Requests
            </h2>

            <p>
              Visitors registered by the
              society security team.
            </p>
          </div>

          <button
            type="button"
            className="resident-refresh-button"
            onClick={loadVisitors}
          >
            Refresh
          </button>

        </div>


        {loading ? (
          <div className="resident-visitors-empty">
            <strong>
              Loading visitors...
            </strong>
          </div>
        ) : visitors.length === 0 ? (
          <div className="resident-visitors-empty">

            <strong>
              No visitors
            </strong>

            <span>
              No visitor requests have been
              registered for your flat.
            </span>

          </div>
        ) : (

          <div className="resident-visitor-list">

            {visitors.map((visitor) => (

              <article
                className="resident-visitor-card"
                key={visitor._id}
              >

                <div className="resident-visitor-main">

                  <div className="resident-visitor-title">

                    <h3>
                      {visitor.visitorName}
                    </h3>

                    <span
                      className={getStatusClass(
                        visitor.status
                      )}
                    >
                      {visitor.status}
                    </span>

                  </div>


                  <div className="resident-visitor-details">

                    <p>
                      <strong>
                        Purpose:
                      </strong>{' '}
                      {visitor.purpose}
                    </p>


                    {visitor.phone && (
                      <p>
                        <strong>
                          Phone:
                        </strong>{' '}
                        {visitor.phone}
                      </p>
                    )}


                    {visitor.vehicleNumber && (
                      <p>
                        <strong>
                          Vehicle:
                        </strong>{' '}
                        {visitor.vehicleNumber}
                      </p>
                    )}


                    <p>
                      <strong>
                        Visitors:
                      </strong>{' '}
                      {visitor.visitorCount}
                    </p>


                    <p>
                      <strong>
                        Request time:
                      </strong>{' '}
                      {formatDate(
                        visitor.entryTime
                      )}
                    </p>


                    {visitor.watchmanId && (
                      <p>
                        <strong>
                          Registered by:
                        </strong>{' '}
                        {visitor.watchmanId.name}
                      </p>
                    )}

                  </div>

                </div>


                {visitor.status === 'WAITING' && (

                  <div className="resident-visitor-actions">

                    <button
                      type="button"
                      className="approve-button"
                      disabled={
                        processingId ===
                        visitor._id
                      }
                      onClick={() =>
                        handleApprove(
                          visitor._id
                        )
                      }
                    >
                      {processingId ===
                      visitor._id
                        ? 'Processing...'
                        : 'Approve'}
                    </button>


                    <button
                      type="button"
                      className="reject-button"
                      disabled={
                        processingId ===
                        visitor._id
                      }
                      onClick={() =>
                        handleReject(
                          visitor._id
                        )
                      }
                    >
                      Reject
                    </button>

                  </div>

                )}

              </article>

            ))}

          </div>

        )}

      </section>

    </section>
  )
}