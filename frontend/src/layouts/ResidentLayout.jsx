import { NavLink, Outlet } from 'react-router-dom'
import NotificationBell from '../components/NotificationBell'

export default function ResidentLayout() {
  return (
    <div className="resident-layout-shell">
      <header className="resident-topbar">
        <strong>
          Socio<span>Hub</span>
        </strong>

        <nav>
          <NavLink to="/resident">
            Overview
          </NavLink>

          <NavLink to="/resident/my-flat">
            My flat
          </NavLink>

          <NavLink to="/resident/my-parking">
            Parking
          </NavLink>

          <NavLink to="/resident/about">
            About society
          </NavLink>

          <NavLink to="/resident/maintenance">
            Maintenance
          </NavLink>

          <NavLink to="/resident/complaints">
            Complaints
          </NavLink>

          <NavLink to="/resident/announcements">
            Announcements
          </NavLink>

          <NavLink to="/resident/community">
            Community
          </NavLink>

          <NavLink to="/resident/visitors">
            Visitors
          </NavLink>
          <NavLink to="/resident/watchmen">
            Watchmen
          </NavLink>

          <NavLink to="/resident/profile">
            Profile
          </NavLink>
        </nav>

        <NotificationBell />

        <button
          type="button"
          onClick={() => {
            localStorage.removeItem(
              'sociohub_token'
            )

            localStorage.removeItem(
              'sociohub_user'
            )

            window.location.href = '/login'
          }}
        >
          Sign out
        </button>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  )
}
