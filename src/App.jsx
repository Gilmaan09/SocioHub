import { useState } from 'react'
import './App.css'

const navigation = [
  { label: 'Overview', icon: 'grid' },
  { label: 'My home', icon: 'home' },
  { label: 'Payments', icon: 'card' },
  { label: 'Complaints', icon: 'alert', count: 2 },
  { label: 'Community', icon: 'chat' },
]

const notices = [
  { title: 'Water tank cleaning', detail: 'Tomorrow, 9:00 AM - 1:00 PM', tag: 'Maintenance', tone: 'yellow' },
  { title: 'Annual general meeting', detail: 'Sunday, 28 September · Clubhouse', tag: 'Society', tone: 'blue' },
  { title: 'Ganesh Chaturthi gathering', detail: 'Saturday, 20 September · Central lawn', tag: 'Events', tone: 'pink' },
]

const discussions = [
  { title: 'Can we add more visitor parking signage?', author: 'Rohan Mehta', time: '12 min ago', replies: 8, initials: 'RM', color: 'coral' },
  { title: 'Looking for a reliable plumber nearby', author: 'Ananya Shah', time: '1 hr ago', replies: 14, initials: 'AS', color: 'violet' },
]

function Icon({ name }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    home: <><path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9" /><path d="M10 20v-6h4v6" /></>,
    card: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18" /><path d="M7 15h4" /></>,
    alert: <><path d="M10.3 3.4 2.2 17a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.4a2 2 0 0 0-3.4 0Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></>,
    chat: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.4 8.4 0 0 1-3.4-.7L4 20l1.4-3.7A7.2 7.2 0 0 1 4 11.5 7.5 7.5 0 0 1 12 4a7.5 7.5 0 0 1 8 7.5Z" /><path d="M8 11.5h.01M12 11.5h.01M16 11.5h.01" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    phone: <><path d="M6.5 3.5 9 3l2 5-2.2 1.7a14 14 0 0 0 5 5L15.5 12l5 2 .5 2.5a3 3 0 0 1-3.3 3.5C10.5 19 5 13.5 4 6.8A3 3 0 0 1 6.5 3.5Z" /></>,
  }
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function App() {
  const [active, setActive] = useState('Overview')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">S</span><span>Socio<span className="brand-accent">Hub</span></span></div>
        <div className="society-switcher"><span className="society-avatar">A</span><span><strong>Amara Heights</strong><small>Andheri East, Mumbai</small></span><span className="chevron">⌄</span></div>
        <p className="menu-label">Workspace</p>
        <nav aria-label="Main navigation">
          {navigation.map((item) => <button key={item.label} className={`nav-item ${active === item.label ? 'active' : ''}`} onClick={() => setActive(item.label)}><Icon name={item.icon} /><span>{item.label}</span>{item.count && <em>{item.count}</em>}</button>)}
        </nav>
        <div className="sidebar-bottom"><p className="menu-label">Manage</p><button className="nav-item"><Icon name="grid" /><span>Society admin</span></button><button className="nav-item"><Icon name="bell" /><span>Help & support</span></button><div className="user-mini"><span className="avatar coral">SK</span><span><strong>Simran Kapoor</strong><small>Owner · A-402</small></span><span className="dots">•••</span></div></div>
      </aside>

      <main className="main-content">
        <header className="topbar"><div className="mobile-brand"><span className="brand-mark">S</span>SocioHub</div><div className="topbar-actions"><button className="notification" aria-label="Notifications"><Icon name="bell" /><span></span></button><div className="profile-chip"><span className="avatar coral">SK</span><span><strong>Simran Kapoor</strong><small>Owner · A-402</small></span><span className="chevron">⌄</span></div></div></header>
        <div className="content-wrap">
          <section className="welcome"><div><p className="eyebrow">Monday, 15 September 2026</p><h1>Good morning, Simran<span>.</span></h1><p className="welcome-copy">Here is what is happening in your community today.</p></div><button className="outline-button"><span>＋</span> Raise a complaint</button></section>

          <section className="stats-grid" aria-label="Society summary"><article className="stat-card accent-card"><div className="stat-top"><span>Maintenance due</span><span className="stat-icon">₹</span></div><strong>₹ 4,850</strong><p>Due on 5 Oct 2026 <span className="warning-dot">●</span></p><button className="text-button">Pay now <Icon name="arrow" /></button></article><article className="stat-card"><div className="stat-top"><span>My home</span><span className="stat-icon soft">⌂</span></div><strong>A-402</strong><p>4th floor · Wing A</p><button className="text-button">View details <Icon name="arrow" /></button></article><article className="stat-card"><div className="stat-top"><span>Open complaints</span><span className="stat-icon soft">!</span></div><strong>02</strong><p>1 needs your attention</p><button className="text-button">Track complaints <Icon name="arrow" /></button></article><article className="stat-card fund-card"><div className="stat-top"><span>Society fund</span><span className="stat-icon mint">◔</span></div><strong>₹ 12.6L</strong><p><span className="positive">↑ 8.4%</span> this quarter</p><button className="text-button">View finances <Icon name="arrow" /></button></article></section>

          <div className="dashboard-grid"><section className="panel notices-panel"><div className="panel-heading"><div><p className="eyebrow">Stay in the loop</p><h2>Latest notices</h2></div><button className="link-button">View all <Icon name="arrow" /></button></div><div className="notice-list">{notices.map((notice) => <article className="notice-row" key={notice.title}><span className={`notice-mark ${notice.tone}`}></span><div><h3>{notice.title}</h3><p>{notice.detail}</p></div><span className={`tag ${notice.tone}`}>{notice.tag}</span></article>)}</div></section><section className="panel home-panel"><div className="panel-heading"><div><p className="eyebrow">Your space</p><h2>My home</h2></div><button className="more-button">•••</button></div><div className="home-visual"><span className="building-shape">A</span><div><strong>Flat A-402</strong><p>Amara Heights · Wing A</p></div></div><div className="home-details"><div><span>Floor</span><strong>4th floor</strong></div><div><span>Area</span><strong>1,240 sq. ft.</strong></div><div><span>Parking</span><strong>P1 · 42</strong></div></div><button className="wide-button">View home details <Icon name="arrow" /></button></section></div>

          <div className="dashboard-grid lower-grid"><section className="panel discussion-panel"><div className="panel-heading"><div><p className="eyebrow">From your neighbours</p><h2>Community discussions</h2></div><button className="link-button">See community <Icon name="arrow" /></button></div><div className="discussion-list">{discussions.map((discussion) => <article className="discussion-row" key={discussion.title}><span className={`avatar ${discussion.color}`}>{discussion.initials}</span><div><h3>{discussion.title}</h3><p>{discussion.author} · {discussion.time}</p></div><span className="replies">{discussion.replies} replies</span></article>)}</div><button className="start-discussion">＋ Start a discussion</button></section><section className="panel contact-panel"><div className="panel-heading"><div><p className="eyebrow">Need a hand?</p><h2>Quick contacts</h2></div><span className="online-dot">● Online</span></div><div className="contact-row"><span className="contact-icon">W</span><div><strong>Ramesh Yadav</strong><p>Watchman · Main gate</p></div><button className="call-button" aria-label="Call Ramesh Yadav"><Icon name="phone" /></button></div><div className="contact-row"><span className="contact-icon manager">M</span><div><strong>Society office</strong><p>Office · 9:30 AM - 6:30 PM</p></div><button className="call-button" aria-label="Call society office"><Icon name="phone" /></button></div><button className="wide-button">View all contacts <Icon name="arrow" /></button></section></div>
        </div>
      </main>
    </div>
  )
}

export default App
