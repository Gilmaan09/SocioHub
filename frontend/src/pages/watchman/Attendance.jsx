import { useEffect, useState } from 'react'
import { watchmanAttendanceApi } from '../../services/api'
import './attendance.css'

export default function Attendance() {
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAttendance() {
    try {
      setLoading(true)
      setError('')

      const result =
        await watchmanAttendanceApi.getMyAttendance()

      setAttendance(result.attendance || [])
    } catch (error) {
      console.error(
        'Failed to load attendance:',
        error
      )

      setError(
        error.message ||
          'Failed to load attendance history'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    watchmanAttendanceApi.getMyAttendance()
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
    <section className="attendance-page">
      <div className="attendance-header">
        <div>
          <p className="page-kicker">
            Security workspace
          </p>

          <h1>Attendance</h1>

          <p>
            View your previous duty sessions and
            working hours.
          </p>
        </div>

        <button
          type="button"
          className="attendance-refresh"
          onClick={loadAttendance}
          disabled={loading}
        >
          {loading
            ? 'Refreshing...'
            : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="attendance-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="attendance-empty">
          Loading attendance...
        </div>
      ) : attendance.length === 0 ? (
        <div className="attendance-empty">
          <h2>No attendance records</h2>

          <p>
            Your completed duty sessions will
            appear here.
          </p>
        </div>
      ) : (
        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
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
                          ? 'attendance-status active'
                          : 'attendance-status completed'
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
