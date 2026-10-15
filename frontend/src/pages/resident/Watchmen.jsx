import { useEffect, useState } from 'react'
import { structureApi } from '../../services/api'
import './watchmen.css'

export default function Watchmen() {
  const [watchmen, setWatchmen] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadWatchmen() {
    try {
      setLoading(true)
      setError('')

      const result =
        await structureApi.getResidentWatchmen()

      setWatchmen(result.watchmen || [])
    } catch (error) {
      console.error(
        'Failed to load watchmen:',
        error
      )

      setError(
        error.message ||
          'Failed to load watchmen'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    structureApi.getResidentWatchmen()
      .then((result) => { if (active) setWatchmen(result.watchmen || []) })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Failed to load watchmen')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <section className="resident-watchmen-page">
      <div className="resident-watchmen-header">
        <div>
          <p className="page-kicker">
            Society security
          </p>

          <h1>Watchmen</h1>

          <p>
            View the security staff currently
            assigned to your society.
          </p>
        </div>

        <button
          type="button"
          className="watchmen-refresh-button"
          onClick={loadWatchmen}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="watchmen-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="watchmen-empty">
          Loading watchmen...
        </div>
      ) : watchmen.length === 0 ? (
        <div className="watchmen-empty">
          <h2>No watchmen found</h2>
          <p>
            There are currently no active watchmen
            assigned to your society.
          </p>
        </div>
      ) : (
        <div className="watchmen-grid">
          {watchmen.map((watchman) => (
            <article
              className="watchman-resident-card"
              key={watchman._id}
            >
              <div className="watchman-card-top">
                <div className="watchman-avatar">
                  {(watchman.name || 'W')
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="watchman-card-name">
                  <h2>
                    {watchman.name}
                  </h2>

                  <span className="watchman-role">
                    Security Watchman
                  </span>
                </div>

                <span
                  className={
                    watchman.onDuty
                      ? 'watchman-status on'
                      : 'watchman-status off'
                  }
                >
                  <span>●</span>

                  {watchman.onDuty
                    ? 'ON DUTY'
                    : 'OFF DUTY'}
                </span>
              </div>

              <div className="watchman-card-details">
                <div>
                  <span>Duty location</span>

                  <strong>
                    {watchman.dutyLocation ||
                      'Not assigned'}
                  </strong>
                </div>

                <div>
                  <span>Contact</span>

                  <strong>
                    {watchman.phone ||
                      'Not available'}
                  </strong>
                </div>

                {watchman.onDuty &&
                  watchman.dutyStart && (
                    <div>
                      <span>
                        On duty since
                      </span>

                      <strong>
                        {new Date(
                          watchman.dutyStart
                        ).toLocaleString()}
                      </strong>
                    </div>
                  )}
              </div>

              {watchman.phone && (
                <a
                  className="watchman-call-button"
                  href={`tel:${watchman.phone}`}
                >
                  📞 Call Watchman
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
