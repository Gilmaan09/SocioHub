import { useState } from 'react'
import { authApi } from '../../services/api'
import './profile.css'

const readUser = () => { try { return JSON.parse(localStorage.getItem('sociohub_user') || '{}') } catch { return {} } }

export default function AdminProfile() {
  const [user, setUser] = useState(readUser)
  const [profile, setProfile] = useState({ name: user.name || '', email: user.email || '', phone: user.phone || '' })
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  async function saveProfile(event) {
    event.preventDefault(); setError(''); setMessage(''); setSaving(true)
    try {
      const result = await authApi.updateProfile(profile)
      setUser(result.user); setProfile({ name: result.user.name, email: result.user.email, phone: result.user.phone || '' })
      localStorage.setItem('sociohub_user', JSON.stringify(result.user)); setMessage('Your profile has been updated.')
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }
  async function changePassword(event) {
    event.preventDefault(); setError(''); setMessage('')
    if (password.newPassword !== password.confirmPassword) return setError('New password and confirmation do not match.')
    setSaving(true)
    try {
      await authApi.changePassword({ currentPassword: password.currentPassword, newPassword: password.newPassword })
      setPassword({ currentPassword: '', newPassword: '', confirmPassword: '' }); setMessage('Your password has been changed.')
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }
  return <section className="admin-page profile-page"><header className="admin-header"><div><p className="page-kicker">Account</p><h1>My profile</h1><p>Manage your administrator details and sign-in password.</p></div></header>
    {message && <p className="profile-notice" role="status">{message}</p>}{error && <p className="form-error" role="alert">{error}</p>}
    <div className="profile-grid"><form className="profile-card" onSubmit={saveProfile}><div className="profile-card-heading"><span className="profile-icon">{user.name?.slice(0, 1).toUpperCase() || 'A'}</span><div><h2>Personal information</h2><p>These details identify you in the society workspace.</p></div></div><label>Full name<input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} required /></label><label>Email address<input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} required /></label><label>Phone number<input type="tel" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} /></label><button className="primary-button" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button></form>
    <form className="profile-card" onSubmit={changePassword}><div className="profile-card-heading"><span className="profile-icon profile-lock">⌑</span><div><h2>Change password</h2><p>Use at least 6 characters for your new password.</p></div></div><label>Current password<input type="password" autoComplete="current-password" value={password.currentPassword} onChange={(e) => setPassword({ ...password, currentPassword: e.target.value })} required /></label><label>New password<input type="password" autoComplete="new-password" minLength="6" value={password.newPassword} onChange={(e) => setPassword({ ...password, newPassword: e.target.value })} required /></label><label>Confirm new password<input type="password" autoComplete="new-password" minLength="6" value={password.confirmPassword} onChange={(e) => setPassword({ ...password, confirmPassword: e.target.value })} required /></label><button className="primary-button" disabled={saving}>{saving ? 'Updating…' : 'Update password'}</button></form></div>
  </section>
}
