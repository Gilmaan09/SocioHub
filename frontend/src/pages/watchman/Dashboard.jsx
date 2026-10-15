import { useEffect, useState } from 'react'
import {
  visitorApi,
  watchmanAttendanceApi,
} from '../../services/api'
import './watchman.css'

export default function Dashboard() {
  const user = JSON.parse(
    localStorage.getItem('sociohub_user') || '{}'
  )

  const [onDuty, setOnDuty] = useState(false)
  const [dutyStart, setDutyStart] = useState(null)

  const [visitorsToday, setVisitorsToday] = useState(0)
  const [waitingApprovals, setWaitingApprovals] = useState(0)

  const [loadingVisitors, setLoadingVisitors] = useState(true)
  const [loadingDuty, setLoadingDuty] = useState(true)
  const [updatingDuty, setUpdatingDuty] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const getGreeting = () => {
    const hour = new Date().getHours()

    if (hour >= 5 && hour < 12) {
      return 'Good morning'
    }

    if (hour >= 12 && hour < 17) {
      return 'Good afternoon'
    }

    if (hour >= 17 && hour < 24) {
      return 'Good evening'
    }

    return 'Good morning'
  }

  async function handleDutyToggle() {
    try {
      setUpdatingDuty(true)
      setMessage('')
      setError('')

      if (onDuty) {
        const result =
          await watchmanAttendanceApi.endDuty()

        setOnDuty(false)
        setDutyStart(null)

        setMessage(
          result.message || 'Duty ended successfully'
        )
      } else {
        const result =
          await watchmanAttendanceApi.startDuty()

        setOnDuty(true)

        if (result.attendance) {
          setDutyStart(
            result.attendance.dutyStart
          )
        }

        setMessage(
          result.message || 'Duty started successfully'
        )
      }
    } catch (error) {
      console.error(
        'Failed to update duty status:',
        error
      )

      setError(
        error.message ||
          'Failed to update duty status'
      )
    } finally {
      setUpdatingDuty(false)
    }
  }

  useEffect(() => {
    let active = true
    Promise.allSettled([
      watchmanAttendanceApi.getCurrentDuty(),
      visitorApi.getTodayVisitors(),
      visitorApi.getWaitingVisitors(),
    ]).then(([dutyResult, todayResult, waitingResult]) => {
      if (!active) return
      if (dutyResult.status === 'fulfilled') {
        setOnDuty(Boolean(dutyResult.value.onDuty))
        setDutyStart(dutyResult.value.attendance?.dutyStart || null)
      } else {
        console.error('Failed to load duty status:', dutyResult.reason)
      }
      if (todayResult.status === 'fulfilled') {
        setVisitorsToday((todayResult.value.visitors || []).length)
      } else {
        console.error('Failed to load today’s visitors:', todayResult.reason)
      }
      if (waitingResult.status === 'fulfilled') {
        setWaitingApprovals((waitingResult.value.visitors || []).length)
      } else {
        console.error('Failed to load waiting visitors:', waitingResult.reason)
      }
    }).finally(() => {
      if (active) {
        setLoadingDuty(false)
        setLoadingVisitors(false)
      }
    })
    return () => { active = false }
  }, [])

  return (
    <section className="watchman-dashboard">
      <p className="page-kicker">
        Security workspace
      </p>

      <h1>
        {getGreeting()}, {user.name || 'Watchman'}.
      </h1>

      <p className="watchman-intro">
        Manage your duty status and society visitors
        from here.
      </p>

      {message && (
        <div className="success-message">
          {message}
        </div>
      )}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <section className="watchman-duty-card">
        <div>
          <p className="page-kicker">
            Current duty
          </p>

          <h2>
            {loadingDuty
              ? 'Checking duty status...'
              : onDuty
                ? 'You are on duty'
                : 'You are off duty'}
          </h2>

          <p>
            {user.dutyLocation
              ? user.dutyLocation
              : 'Duty location not specified'}
          </p>

          {onDuty && dutyStart && (
            <small>
              On duty since:{' '}
              {new Date(dutyStart).toLocaleString()}
            </small>
          )}
        </div>

        <div className="watchman-duty-status">
          <span
            className={
              onDuty
                ? 'duty-indicator on'
                : 'duty-indicator off'
            }
          >
            ●
          </span>

          <strong>
            {loadingDuty
              ? 'CHECKING'
              : onDuty
                ? 'ON DUTY'
                : 'OFF DUTY'}
          </strong>

          <button
            type="button"
            className="primary-button"
            onClick={handleDutyToggle}
            disabled={
              loadingDuty || updatingDuty
            }
          >
            {updatingDuty
              ? 'Updating...'
              : onDuty
                ? 'Go Off Duty'
                : 'Go On Duty'}
          </button>
        </div>
      </section>

      <div className="watchman-summary-grid">
        <article className="watchman-summary-card">
          <span>Duty location</span>

          <strong>
            {user.dutyLocation || 'Not assigned'}
          </strong>

          <small>
            Your assigned security location
          </small>
        </article>

        <article className="watchman-summary-card">
          <span>Visitors today</span>

          <strong>
            {loadingVisitors
              ? '...'
              : visitorsToday}
          </strong>

          <small>
            Visitors registered today
          </small>
        </article>

        <article className="watchman-summary-card">
          <span>Waiting approvals</span>

          <strong>
            {loadingVisitors
              ? '...'
              : waitingApprovals}
          </strong>

          <small>
            Visitors awaiting resident response
          </small>
        </article>
      </div>
    </section>
  )
}
