import { NavLink, Outlet } from 'react-router-dom'
import NotificationBell from '../components/NotificationBell'
import './watchman-layout.css'

export default function WatchmanLayout() {
  const user = JSON.parse(
    localStorage.getItem('sociohub_user') || '{}'
  )

  return (
    <div className="watchman-shell">
      <aside className="watchman-sidebar">
        <div className="watchman-brand">
          <span className="brand-mark">S</span>
          <span>
            Socio<span>Hub</span>
          </span>
        </div>

        <p className="watchman-label">
          Security workspace
        </p>

        <nav>
          <NavLink to="/watchman" end>
            Dashboard
          </NavLink>

          <NavLink to="/watchman/visitors">
            Visitors
          </NavLink>

          <NavLink to="/watchman/attendance">
            Attendance
          </NavLink>

          <NavLink to="/watchman/profile">
            Profile
          </NavLink>
        </nav>

        <div className="watchman-sidebar-bottom">
          <div className="watchman-user">
            <strong>{user.name || 'Watchman'}</strong>
            <small>Watchman</small>
          </div>

          <button
            type="button"
            className="watchman-signout"
            onClick={() => {
              localStorage.clear()
              window.location.href = '/login'
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="watchman-main">
        <header className="watchman-navbar">
          <div>
            <strong>Security</strong>
            <span>
              {user.name || 'Watchman'}
            </span>
          </div>
          <NotificationBell />
        </header>

        <main className="watchman-content">
          <Outlet />
        </main>
      </main>
    </div>
  )
}