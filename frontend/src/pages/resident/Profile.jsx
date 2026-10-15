import { useState } from 'react'
import { authApi } from '../../services/api'
import './resident.css'

export default function Profile() {
  const user = JSON.parse(
    localStorage.getItem('sociohub_user') || '{}'
  )

  const [profile, setProfile] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const mustChangePassword = user.mustChangePassword === true

  function updatePasswordField(event) {
    setPasswordForm({
      ...passwordForm,
      [event.target.name]: event.target.value
    })
  }

  async function handleChangePassword(event) {
    event.preventDefault()

    setMessage('')
    setError('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError('New password must be at least 6 characters')
      return
    }

    try {
      setChangingPassword(true)

      const result = await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      })

      // Update local user information
      const updatedUser = {
        ...user,
        mustChangePassword: false
      }

      localStorage.setItem(
        'sociohub_user',
        JSON.stringify(updatedUser)
      )

      setMessage(result.message)

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <section className="resident-page">

      <p className="page-kicker">Account</p>

      <h1>Profile</h1>

      {/* PROFILE INFORMATION */}

      <div className="detail-panel profile-panel">

        <h2>Profile Information</h2>

        <label>
          Name

          <input
            value={profile.name}
            onChange={(event) =>
              setProfile({
                ...profile,
                name: event.target.value
              })
            }
          />
        </label>

        <label>
          Email

          <input
            value={profile.email}
            readOnly
          />
        </label>

        <label>
          Phone

          <input
            value={profile.phone}
            onChange={(event) =>
              setProfile({
                ...profile,
                phone: event.target.value
              })
            }
          />
        </label>

      </div>


      {/* ACCOUNT SECURITY */}

      <div className="detail-panel profile-panel">

        <h2>Account Security</h2>

        {mustChangePassword ? (
          <p>
            Your account is using a temporary password provided by
            your society admin. Please change it before continuing.
          </p>
        ) : (
          <p>
            Change your password to keep your SocioHub account secure.
          </p>
        )}

        {message && (
          <p className="form-success">
            {message}
          </p>
        )}

        {error && (
          <p className="form-error">
            {error}
          </p>
        )}

        <form onSubmit={handleChangePassword}>

          <label>
            Current Password

            <input
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={updatePasswordField}
              required
            />
          </label>

          <label>
            New Password

            <input
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={updatePasswordField}
              minLength="6"
              required
            />
          </label>

          <label>
            Confirm New Password

            <input
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={updatePasswordField}
              minLength="6"
              required
            />
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={changingPassword}
          >
            {changingPassword
              ? 'Changing password...'
              : 'Change Password'}
          </button>

        </form>

      </div>

    </section>
  )
}