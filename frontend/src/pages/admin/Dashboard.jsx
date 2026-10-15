import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/admin/StatCard'
import RecentActivity from '../../components/admin/RecentActivity'
import { structureApi } from '../../services/api'
import './dashboard.css'

export default function Dashboard() {
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

  const [stats, setStats] = useState({
    flats: 0,
    residents: 0,
    pendingComplaints: 0,
    fundBalance: 0,
    fundTransactions: 0,
    openingBalanceSet: false,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboardStats() {
      try {
        setLoading(true)
        setError('')

        const [
          flatResult,
          residentResult,
          complaintResult,
          financeResult,
        ] = await Promise.all([
          structureApi.getFlats(),
          structureApi.getResidents(),
          structureApi.getAdminComplaints(),
          structureApi.getFinanceSummary(),
        ])

        const flats = flatResult.flats || []
        const residents = residentResult.residents || []
        const complaints = complaintResult.complaints || []

        const pendingStatuses = [
          'OPEN',
          'ASSIGNED',
          'IN_PROGRESS'
        ]

        const pendingComplaints = complaints.filter(
          (complaint) =>
            pendingStatuses.includes(
              complaint.status?.toUpperCase()
            )
        )

        setStats({
          flats: flats.length,
          residents: residents.length,
          pendingComplaints:
            pendingComplaints.length,
          fundBalance: financeResult.summary.currentBalance,
          fundTransactions: financeResult.summary.transactionCount,
          openingBalanceSet: financeResult.summary.openingBalanceSet,
        })
      } catch (requestError) {
        setError(requestError.message)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardStats()
  }, [])

  return (
    <section className="admin-dashboard">

      {/* ========================= */}
      {/* WELCOME */}
      {/* ========================= */}

      <div className="admin-welcome">

        <div>
          <p className="admin-kicker">
            Admin workspace
          </p>

          <h1>
            {getGreeting()}, {user.name || 'Admin'}.
          </h1>

          <p>
            Here is the current pulse of your society workspace.
          </p>
        </div>

        <Link
          className="admin-primary-action"
          to="/admin/society"
        >
          Society details
        </Link>

      </div>


      {/* ========================= */}
      {/* ERROR */}
      {/* ========================= */}

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}


      {/* ========================= */}
      {/* STAT CARDS */}
      {/* ========================= */}

      <section className="admin-stat-grid">

        <StatCard
          label="Total flats"
          value={loading ? '...' : stats.flats}
          detail="Flats in your society"
          tone="coral"
        />

        <StatCard
          label="Residents"
          value={loading ? '...' : stats.residents}
          detail="Owner and tenant accounts"
        />

        <StatCard
          label="Pending complaints"
          value={
            loading
              ? '...'
              : stats.pendingComplaints
          }
          detail="Complaints awaiting action"
        />

        <StatCard
          label="Society fund"
          value={loading ? '...' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats.fundBalance)}
          detail={stats.openingBalanceSet ? `${stats.fundTransactions} recorded transactions` : 'Opening balance not set'}
          tone="mint"
        />

      </section>


      {/* ========================= */}
      {/* CONTENT */}
      {/* ========================= */}

      <div className="admin-content-grid">

        <RecentActivity />

        <section className="admin-panel admin-quick-panel">

          <p className="admin-kicker">
            Society
          </p>

          <h2>
            Manage your society
          </h2>

          <p>
            Manage society details, wings, flats, parking
            and resident accounts.
          </p>

          <Link
            className="admin-secondary-action"
            to="/admin/society"
          >
            Open society management
          </Link>

        </section>

      </div>

    </section>
  )
}
