import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { structureApi } from '../../services/api'
import './resident.css'

export default function Dashboard() {
  const [flat, setFlat] = useState(null)
  const [bills, setBills] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [error, setError] = useState('')

  const user = JSON.parse(
    localStorage.getItem('sociohub_user') || '{}'
  )

  // =========================
  // DYNAMIC GREETING
  // =========================

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

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        const [
          flatResult,
          billResult,
          announcementResult
        ] = await Promise.all([
          structureApi.getMyFlat(),
          structureApi.getMyBills(),
          structureApi.getMyAnnouncements()
        ])

        if (!cancelled) {
          setFlat(flatResult.flat)

          setBills(
            billResult.bills || []
          )

          setAnnouncements(
            announcementResult.announcements || []
          )
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
        }
      }
    }

    loadDashboard()

    return () => {
      cancelled = true
    }
  }, [])

  const parking = flat?.parkingIds?.[0]

  // Find the first bill that is not paid.
  const pendingBill = bills.find(
    (bill) =>
      bill.status !== 'PAID' &&
      bill.status !== 'CLOSED'
  )

  // Latest announcement
  const latestAnnouncement =
    announcements[0]

  return (
    <section className="resident-page">

      {/* ========================= */}
      {/* WELCOME */}
      {/* ========================= */}

      <p className="page-kicker">
        Resident space
      </p>

      <h1>
        {getGreeting()}, {user.name || 'resident'}.
      </h1>

      <p className="resident-intro">
        Your home and community information, all in one place.
      </p>


      {/* ========================= */}
      {/* ERROR */}
      {/* ========================= */}

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}


      {/* ========================= */}
      {/* HOME SUMMARY */}
      {/* ========================= */}

      <div className="resident-hero">

        {flat ? (
          <>

            <strong>
              {flat.wingId?.name}-{flat.number}
            </strong>

            <span>
              {flat.floor}
              {flat.floor === 1
                ? 'st'
                : flat.floor === 2
                  ? 'nd'
                  : flat.floor === 3
                    ? 'rd'
                    : 'th'}{' '}
              Floor · {flat.type || 'Home'}
            </span>

          </>
        ) : (

          <span>
            Your flat has not been assigned yet.
          </span>

        )}

      </div>


      {/* ========================= */}
      {/* RESIDENT CARDS */}
      {/* ========================= */}

      <div className="resident-cards">

        {/* MY FLAT */}

        <Link to="/resident/my-flat">

          <span>
            My flat
          </span>

          <strong>
            {flat
              ? `${flat.wingId?.name}-${flat.number}`
              : 'Not assigned'}
          </strong>

          <small>
            {flat?.type ||
              'View property details'}
          </small>

        </Link>


        {/* MY PARKING */}

        <Link to="/resident/my-parking">

          <span>
            My parking
          </span>

          <strong>
            {parking?.slotNumber ||
              'Not assigned'}
          </strong>

          <small>
            {parking?.type ||
              'View parking details'}
          </small>

        </Link>


        {/* MAINTENANCE */}

        <Link
          to={
            pendingBill
              ? `/resident/maintenance/${pendingBill._id}`
              : '/resident/maintenance'
          }
        >

          <span>
            Maintenance
          </span>

          <strong>
            {pendingBill
              ? `₹${pendingBill.totalAmount.toLocaleString(
                  'en-IN'
                )}`
              : 'No dues'}
          </strong>

          <small>
            {pendingBill
              ? `Due ${new Date(
                  pendingBill.dueDate
                ).toLocaleDateString('en-IN')}`
              : 'All maintenance bills are clear'}
          </small>

        </Link>

      </div>


      {/* ========================= */}
      {/* LATEST ANNOUNCEMENT */}
      {/* ========================= */}

      <article className="announcement">

        <p className="page-kicker">
          Latest announcement
        </p>

        {latestAnnouncement ? (
          <>

            <h2>
              {latestAnnouncement.title}
            </h2>

            <p>
              {latestAnnouncement.description ||
                latestAnnouncement.content ||
                'View the announcement for more details.'}
            </p>

            <Link
              to={`/resident/announcements/${latestAnnouncement._id}`}
              className="text-button"
            >
              View announcement
            </Link>

          </>
        ) : (

          <>

            <h2>
              No announcements yet
            </h2>

            <p>
              There are no official announcements
              available for your society.
            </p>

          </>

        )}

      </article>

    </section>
  )
}