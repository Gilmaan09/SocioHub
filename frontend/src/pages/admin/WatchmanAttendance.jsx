import { useEffect, useState } from 'react'
import { watchmanAttendanceApi } from '../../services/api'
import './watchman-attendance.css'

export default function WatchmanAttendance() {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAttendance() {
    try {
      setLoading(true)
      setError('')

      const result =
        await watchmanAttendanceApi.getSocietyAttendance()

      setAttendance(result.attendance || [])
    } catch (error) {
      console.error(
        'Failed to load watchman attendance:',
        error
      )

      setError(
        error.message ||
          'Failed to load attendance'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    watchmanAttendanceApi.getSocietyAttendance()
      .then((result) => { if (active) setAttendance(result.attendance || []) })
      .catch((requestError) => {
        if (active) setError(requestError.message || 'Failed to load attendance')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  function formatDate(date) {
    if (!date) return '-'

    return new Date(date).toLocaleDateString(
      'en-IN',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }
    )
  }

  function formatTime(date) {
    if (!date) return '-'

    return new Date(date).toLocaleTimeString(
      'en-IN',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    )
  }

  function calculateDuration(start, end) {
    if (!start || !end) return '-'

    const difference =
      new Date(end).getTime() -
      new Date(start).getTime()

    const totalMinutes = Math.floor(
      difference / (1000 * 60)
    )

    const hours = Math.floor(
      totalMinutes / 60
    )

    const minutes = totalMinutes % 60

    if (hours === 0) {
      return `${minutes} min`
    }

    return `${hours}h ${minutes}m`
  }

  return (
    <section className="admin-attendance-page">
      <div className="admin-attendance-header">
        <div>
          <p className="page-kicker">
            Security management
          </p>

          <h1>Watchman Attendance</h1>

          <p>
            Review duty sessions and working hours
            of your society's security staff.
          </p>
        </div>

        <button
          type="button"
          className="admin-attendance-refresh"
          onClick={loadAttendance}
          disabled={loading}
        >
          {loading
            ? 'Refreshing...'
            : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="admin-attendance-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="admin-attendance-empty">
          Loading attendance...
        </div>
      ) : attendance.length === 0 ? (
        <div className="admin-attendance-empty">
          <h2>No attendance records</h2>

          <p>
            Watchman duty sessions will appear here
            once they are recorded.
          </p>
        </div>
      ) : (
        <div className="admin-attendance-table-wrapper">
          <table className="admin-attendance-table">
            <thead>
              <tr>
                <th>Watchman</th>
                <th>Date</th>
                <th>Duty Start</th>
                <th>Duty End</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td>
                    <div className="attendance-watchman">
                      <strong>
                        {record.watchmanId?.name ||
                          'Unknown'}
                      </strong>

                      <small>
                        {record.watchmanId?.phone ||
                          'No phone'}
                      </small>
                    </div>
                  </td>

                  <td>
                    {formatDate(
                      record.dutyStart
                    )}
                  </td>

                  <td>
                    {formatTime(
                      record.dutyStart
                    )}
                  </td>

                  <td>
                    {formatTime(
                      record.dutyEnd
                    )}
                  </td>

                  <td>
                    {calculateDuration(
                      record.dutyStart,
                      record.dutyEnd
                    )}
                  </td>

                  <td>
                    <span
                      className={
                        record.status ===
                        'ON_DUTY'
                          ? 'admin-attendance-status active'
                          : 'admin-attendance-status completed'
                      }
                    >
                      {record.status ===
                      'ON_DUTY'
                        ? 'ON DUTY'
                        : 'COMPLETED'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
