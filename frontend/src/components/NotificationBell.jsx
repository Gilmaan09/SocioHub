import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { notificationApi } from '../services/api'
import './notification-bell.css'

export default function NotificationBell() {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const refreshCount = () => {
      notificationApi.getUnreadCount()
        .then(({ unreadCount: count }) => { if (active) setUnreadCount(count) })
        .catch(() => { })
    }
    refreshCount()
    const intervalId = window.setInterval(refreshCount, 30000)
    return () => { active = false; window.clearInterval(intervalId) }
  }, [])

  async function openInbox() {
    const nextOpen = !isOpen
    setIsOpen(nextOpen)
    if (!nextOpen) return
    setError('')
    try {
      const result = await notificationApi.getMine()
      setNotifications(result.notifications)
      setUnreadCount(result.unreadCount)
    } catch (requestError) { setError(requestError.message) }
  }

  async function openNotification(notification) {
    try {
      if (!notification.readAt) await notificationApi.markRead(notification._id)
      setNotifications((current) => current.map((item) => item._id === notification._id ? { ...item, readAt: new Date().toISOString() } : item))
      setUnreadCount((count) => Math.max(0, count - (notification.readAt ? 0 : 1)))
      setIsOpen(false)
      navigate(notification.href)
    } catch (requestError) { setError(requestError.message) }
  }

  async function markAllRead() {
    try {
      await notificationApi.markAllRead()
      const now = new Date().toISOString()
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || now })))
      setUnreadCount(0)
    } catch (requestError) { setError(requestError.message) }
  }

  return <div className="notification-control">
    <button className="notification-trigger" type="button" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={isOpen} onClick={openInbox}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></svg>
      {unreadCount > 0 && <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>
    {isOpen && <section className="notification-popover" aria-label="Notifications inbox"><header><div><strong>Notifications</strong><small>{unreadCount} unread</small></div><button type="button" onClick={markAllRead} disabled={!unreadCount}>Mark all read</button></header>{error && <p className="notification-error">{error}</p>}<div className="notification-list">{notifications.map((notification) => <button type="button" className={`notification-item ${notification.readAt ? 'read' : 'unread'}`} key={notification._id} onClick={() => openNotification(notification)}><span className="notification-dot" /><span className="notification-copy"><strong>{notification.title}</strong><span>{notification.message}</span><small>{new Date(notification.createdAt).toLocaleString()}</small></span></button>)}{notifications.length === 0 && !error && <p className="notification-empty">You’re all caught up.</p>}</div></section>}
  </div>
}
