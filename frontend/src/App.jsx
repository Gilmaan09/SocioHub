import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import Community from './pages/resident/community/Community'

import Residents from './pages/admin/Residents'
import Watchmen from './pages/admin/Watchmen'
import AdminDashboard from './pages/admin/Dashboard'
import AdminLayout from './layouts/AdminLayout'
import Society from './pages/admin/Society'
import Wings from './pages/admin/Wings'
import Flats from './pages/admin/Flats'
import Parking from './pages/admin/Parking'
import AdminBills from './pages/admin/maintenance/Bills'
import AdminFinance from './pages/admin/Finance'
import AdminReports from './pages/admin/Reports'
import AdminProfile from './pages/admin/Profile'

import ResidentMaintenance from './pages/resident/maintenance/Maintenance'
import ResidentBillDetails from './pages/resident/maintenance/BillDetails'
import PaymentHistory from './pages/resident/maintenance/PaymentHistory'
import ResidentVisitors from './pages/resident/Visitors'
import ResidentComplaints from './pages/resident/complaints/Complaints'
import CreateComplaint from './pages/resident/complaints/CreateComplaint'
import ResidentComplaintDetails from './pages/resident/complaints/ComplaintDetails'

import AdminComplaints from './pages/admin/complaints/Complaints'
import AdminComplaintDetails from './pages/admin/complaints/ComplaintDetails'

import AdminAnnouncements from './pages/admin/announcements/Announcements'
import CreateAnnouncement from './pages/admin/announcements/CreateAnnouncement'
import AdminAnnouncementDetails from './pages/admin/announcements/AnnouncementDetails'

import ResidentAnnouncements from './pages/resident/announcements/Announcements'
import ResidentAnnouncementDetails from './pages/resident/announcements/AnnouncementDetails'
import ResidentWatchmen from './pages/resident/Watchmen'
import ResidentLayout from './layouts/ResidentLayout'
import Dashboard from './pages/resident/Dashboard'
import MyFlat from './pages/resident/MyFlat'
import MyParking from './pages/resident/MyParking'
import Profile from './pages/resident/Profile'
import AboutSociety from './pages/resident/AboutSociety'

import WatchmanLayout from './layouts/WatchmanLayout'
import WatchmanDashboard from './pages/watchman/Dashboard'
import WatchmanProfile from './pages/watchman/Profile'
import WatchmanVisitors from './pages/watchman/Visitors'
import WatchmanAttendance from './pages/watchman/Attendance'
import AdminWatchmanAttendance from './pages/admin/WatchmanAttendance'
import Login from './pages/Login'
import Register from './pages/Register'
import HomePage from './pages/HomePage'


import './App.css'


const navigation = [
  { label: 'Overview', icon: 'grid' },
  { label: 'My home', icon: 'home' },
  { label: 'Payments', icon: 'card' },
  { label: 'Complaints', icon: 'alert', count: 2 },
  { label: 'Community', icon: 'chat' },
]


const notices = [
  {
    title: 'Water tank cleaning',
    detail: 'Tomorrow, 9:00 AM - 1:00 PM',
    tag: 'Maintenance',
    tone: 'yellow',
  },
  {
    title: 'Annual general meeting',
    detail: 'Sunday, 28 September · Clubhouse',
    tag: 'Society',
    tone: 'blue',
  },
  {
    title: 'Ganesh Chaturthi gathering',
    detail: 'Saturday, 20 September · Central lawn',
    tag: 'Events',
    tone: 'pink',
  },
]


const discussions = [
  {
    title: 'Can we add more visitor parking signage?',
    author: 'Rohan Mehta',
    time: '12 min ago',
    replies: 8,
    initials: 'RM',
    color: 'coral',
  },
  {
    title: 'Looking for a reliable plumber nearby',
    author: 'Ananya Shah',
    time: '1 hr ago',
    replies: 14,
    initials: 'AS',
    color: 'violet',
  },
]


function Icon({ name }) {
  const paths = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),

    home: (
      <>
        <path d="m3 10 9-7 9 7" />
        <path d="M5 9v11h14V9" />
        <path d="M10 20v-6h4v6" />
      </>
    ),

    card: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 10h18" />
        <path d="M7 15h4" />
      </>
    ),

    alert: (
      <>
        <path d="M10.3 3.4 2.2 17a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),

    chat: (
      <>
        <path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.4 8.4 0 0 1-3.4-.7L4 20l1.4-3.7A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" />
        <path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" />
      </>
    ),

    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),

    arrow: (
      <>
        <path d="M5 12h14" />
        <path d="m13 6 6 6-6 6" />
      </>
    ),

    phone: (
      <path d="M6.5 3.5 9 3l2 5-2.2 1.7a14 14 0 0 0 5 5L15.5 12l5 2 .5 2.5a3 3 0 0 1-3.3 3.5C10.5 19 5 13.5 4 6.8A3 3 0 0 1 6.5 3.5Z" />
    ),
  }

  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}


function DashboardHome() {
  const [active, setActive] = useState('Overview')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span>
            Socio<span className="brand-accent">Hub</span>
          </span>
        </div>

        <div className="society-switcher">
          <span className="society-avatar">A</span>
          <span>
            <strong>Amara Heights</strong>
            <small>Andheri East, Mumbai</small>
          </span>
          <span className="chevron">⌄</span>
        </div>

        <p className="menu-label">Workspace</p>

        <nav aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${active === item.label ? 'active' : ''
                }`}
              onClick={() => setActive(item.label)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {item.count && <em>{item.count}</em>}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p className="menu-label">Manage</p>

          <button className="nav-item">
            <Icon name="grid" />
            <span>Society admin</span>
          </button>

          <button className="nav-item">
            <Icon name="bell" />
            <span>Help & support</span>
          </button>

          <div className="user-mini">
            <span className="avatar coral">SK</span>
            <span>
              <strong>Simran Kapoor</strong>
              <small>Owner · A-402</small>
            </span>
            <span className="dots">•••</span>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">S</span>
            SocioHub
          </div>

          <div className="topbar-actions">
            <button
              className="notification"
              aria-label="Notifications"
            >
              <Icon name="bell" />
              <span></span>
            </button>

            <div className="profile-chip">
              <span className="avatar coral">SK</span>
              <span>
                <strong>Simran Kapoor</strong>
                <small>Owner · A-402</small>
              </span>
              <span className="chevron">⌄</span>
            </div>
          </div>
        </header>

        <div className="content-wrap">
          <section className="welcome">
            <div>
              <p className="eyebrow">
                Monday, 15 September 2026
              </p>

              <h1>
                Good morning, Simran<span>.</span>
              </h1>

              <p className="welcome-copy">
                Here is what is happening in your community today.
              </p>
            </div>

            <button className="outline-button">
              <span>＋</span>
              Raise a complaint
            </button>
          </section>

          <section
            className="stats-grid"
            aria-label="Society summary"
          >
            <article className="stat-card accent-card">
              <div className="stat-top">
                <span>Maintenance due</span>
                <span className="stat-icon">₹</span>
              </div>

              <strong>₹ 4,850</strong>

              <p>
                Due on 5 Oct 2026{' '}
                <span className="warning-dot">●</span>
              </p>

              <button className="text-button">
                Pay now <Icon name="arrow" />
              </button>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>My home</span>
                <span className="stat-icon soft">⌂</span>
              </div>

              <strong>A-402</strong>

              <p>4th floor · Wing A</p>

              <button className="text-button">
                View details <Icon name="arrow" />
              </button>
            </article>

            <article className="stat-card">
              <div className="stat-top">
                <span>Open complaints</span>
                <span className="stat-icon soft">!</span>
              </div>

              <strong>02</strong>

              <p>1 needs your attention</p>

              <button className="text-button">
                Track complaints <Icon name="arrow" />
              </button>
            </article>

            <article className="stat-card fund-card">
              <div className="stat-top">
                <span>Society fund</span>
                <span className="stat-icon mint">◔</span>
              </div>

              <strong>₹ 12.6L</strong>

              <p>
                <span className="positive">↑ 8.4%</span> this quarter
              </p>

              <button className="text-button">
                View finances <Icon name="arrow" />
              </button>
            </article>
          </section>

          <div className="dashboard-grid">
            <section className="panel notices-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Stay in the loop</p>
                  <h2>Latest notices</h2>
                </div>

                <button className="link-button">
                  View all <Icon name="arrow" />
                </button>
              </div>

              <div className="notice-list">
                {notices.map((notice) => (
                  <article
                    className="notice-row"
                    key={notice.title}
                  >
                    <span
                      className={`notice-mark ${notice.tone}`}
                    ></span>

                    <div>
                      <h3>{notice.title}</h3>
                      <p>{notice.detail}</p>
                    </div>

                    <span
                      className={`tag ${notice.tone}`}
                    >
                      {notice.tag}
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <section className="panel home-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Your space</p>
                  <h2>My home</h2>
                </div>

                <button className="more-button">•••</button>
              </div>

              <div className="home-visual">
                <span className="building-shape">A</span>

                <div>
                  <strong>Flat A-402</strong>
                  <p>Amara Heights · Wing A</p>
                </div>
              </div>

              <div className="home-details">
                <div>
                  <span>Floor</span>
                  <strong>4th floor</strong>
                </div>

                <div>
                  <span>Area</span>
                  <strong>1,240 sq. ft.</strong>
                </div>

                <div>
                  <span>Parking</span>
                  <strong>P1 · 42</strong>
                </div>
              </div>

              <button className="wide-button">
                View home details <Icon name="arrow" />
              </button>
            </section>
          </div>

          <div className="dashboard-grid lower-grid">
            <section className="panel discussion-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">
                    From your neighbours
                  </p>

                  <h2>Community discussions</h2>
                </div>

                <button className="link-button">
                  See community <Icon name="arrow" />
                </button>
              </div>

              <div className="discussion-list">
                {discussions.map((discussion) => (
                  <article
                    className="discussion-row"
                    key={discussion.title}
                  >
                    <span
                      className={`avatar ${discussion.color}`}
                    >
                      {discussion.initials}
                    </span>

                    <div>
                      <h3>{discussion.title}</h3>

                      <p>
                        {discussion.author} · {discussion.time}
                      </p>
                    </div>

                    <span className="replies">
                      {discussion.replies} replies
                    </span>
                  </article>
                ))}
              </div>

              <button className="start-discussion">
                ＋ Start a discussion
              </button>
            </section>

            <section className="panel contact-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Need a hand?</p>
                  <h2>Quick contacts</h2>
                </div>

                <span className="online-dot">
                  ● Online
                </span>
              </div>

              <div className="contact-row">
                <span className="contact-icon">W</span>

                <div>
                  <strong>Ramesh Yadav</strong>
                  <p>Watchman · Main gate</p>
                </div>

                <button
                  className="call-button"
                  aria-label="Call Ramesh Yadav"
                >
                  <Icon name="phone" />
                </button>
              </div>

              <div className="contact-row">
                <span className="contact-icon manager">
                  M
                </span>

                <div>
                  <strong>Society office</strong>
                  <p>Office · 9:30 AM - 6:30 PM</p>
                </div>

                <button
                  className="call-button"
                  aria-label="Call society office"
                >
                  <Icon name="phone" />
                </button>
              </div>

              <button className="wide-button">
                View all contacts <Icon name="arrow" />
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}


function RoleRoute({ roles, children }) {
  const token = localStorage.getItem('sociohub_token')

  const user = JSON.parse(
    localStorage.getItem('sociohub_user') || 'null'
  )

  if (!token || !user) {
    return <Navigate to="/login" replace />
  }

  if (!roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  // Residents using a temporary password
  // can only access their Profile page.
  if (
    (user.role === 'OWNER' || user.role === 'TENANT') &&
    user.mustChangePassword &&
    window.location.pathname !== '/resident/profile'
  ) {
    return (
      <Navigate
        to="/resident/profile?changePassword=1"
        replace
      />
    )
  }

  return children
}


function HomeRoute() {
  return <HomePage />
}


function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />

      <Route
        path="/preview"
        element={<DashboardHome />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* ADMIN ROUTES */}

      <Route
        path="/admin"
        element={
          <RoleRoute roles={['ADMIN']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="society"
          element={<Society />}
        />

        <Route
          path="wings"
          element={<Wings />}
        />

        <Route
          path="flats"
          element={<Flats />}
        />

        <Route
          path="parking"
          element={<Parking />}
        />

        <Route
          path="residents"
          element={<Residents />}
        />

        <Route
          path="watchmen"
          element={<Watchmen />}
        />
        <Route
          path="watchman-attendance"
          element={<AdminWatchmanAttendance />}
        />

        <Route
          path="maintenance/bills"
          element={<AdminBills />}
        />

        <Route
          path="finance"
          element={<AdminFinance />}
        />

        <Route path="reports" element={<AdminReports />} />
        <Route path="profile" element={<AdminProfile />} />

        <Route
          path="complaints"
          element={<AdminComplaints />}
        />

        <Route
          path="complaints/:id"
          element={<AdminComplaintDetails />}
        />

        <Route
          path="announcements"
          element={<AdminAnnouncements />}
        />

        <Route
          path="announcements/new"
          element={<CreateAnnouncement />}
        />

        <Route
          path="community"
          element={<Community />}
        />

        <Route
          path="announcements/:id"
          element={<AdminAnnouncementDetails />}
        />
      </Route>


      {/* WATCHMAN ROUTES */}

      <Route
        path="/watchman"
        element={
          <RoleRoute roles={['WATCHMAN']}>
            <WatchmanLayout />
          </RoleRoute>
        }
      >
        <Route
          index
          element={<WatchmanDashboard />}
        />
        <Route path="visitors" element={<WatchmanVisitors />} />
        <Route
          path="attendance"
          element={<WatchmanAttendance />}
        />
        <Route
          path="profile"
          element={<WatchmanProfile />}
        />
      </Route>


      {/* RESIDENT ROUTES */}

      <Route
        path="/resident"
        element={
          <RoleRoute
            roles={['OWNER', 'TENANT']}
          >
            <ResidentLayout />
          </RoleRoute>
        }
      >
        <Route
          index
          element={<Dashboard />}
        />

        <Route
          path="visitors"
          element={<ResidentVisitors />}
        />
        <Route
          path="watchmen"
          element={<ResidentWatchmen />}
        />

        <Route
          path="my-flat"
          element={<MyFlat />}
        />

        <Route
          path="my-parking"
          element={<MyParking />}
        />

        <Route path="about" element={<AboutSociety />} />

        <Route
          path="maintenance"
          element={<ResidentMaintenance />}
        />

        <Route
          path="maintenance/:id"
          element={<ResidentBillDetails />}
        />

        <Route
          path="maintenance/history"
          element={<PaymentHistory />}
        />

        <Route
          path="complaints"
          element={<ResidentComplaints />}
        />

        <Route
          path="complaints/new"
          element={<CreateComplaint />}
        />

        <Route
          path="complaints/:id"
          element={<ResidentComplaintDetails />}
        />

        <Route
          path="announcements"
          element={<ResidentAnnouncements />}
        />

        <Route
          path="announcements/:id"
          element={<ResidentAnnouncementDetails />}
        />

        <Route
          path="community"
          element={<Community />}
        />

        <Route
          path="profile"
          element={<Profile />}
        />
      </Route>
    </Routes>
  )
}

export default App
