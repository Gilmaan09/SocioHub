import { useEffect, useState } from 'react'
import {
  authApi,
  structureApi
} from '../../services/api'
import './watchman.css'

export default function Profile() {
  const user = JSON.parse(
    localStorage.getItem('sociohub_user') || '{}'
  )

  const [society, setSociety] = useState(null)
const [loadingSociety, setLoadingSociety] = useState(true)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [changingPassword, setChangingPassword] =
    useState(false)

    useEffect(() => {
  async function loadSociety() {
    try {
      const result =
        await structureApi.getMySociety()

      setSociety(result.society)
    } catch (error) {
      console.error(
        'Failed to load society:',
        error
      )
    } finally {
      setLoadingSociety(false)
    }
  }

  loadSociety()
}, [])

  const mustChangePassword =
    user.mustChangePassword === true

  function updatePasswordField(event) {
    setPasswordForm({
      ...passwordForm,
      [event.target.name]: event.target.value,
    })
  }

  async function handleChangePassword(event) {
    event.preventDefault()

    setMessage('')
    setError('')

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setError(
        'New password must be at least 6 characters'
      )
      return
    }

    try {
      setChangingPassword(true)

      const result =
        await authApi.changePassword({
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword,
        })

      const updatedUser = {
        ...user,
        mustChangePassword: false,
      }

      localStorage.setItem(
        'sociohub_user',
        JSON.stringify(updatedUser)
      )

      setMessage(result.message)

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <section className="watchman-profile">

      <p className="page-kicker">
        Account
      </p>

      <h1>Profile</h1>

      <p className="watchman-intro">
        View your account and security information.
      </p>

      {/* PROFILE INFORMATION */}

      <div className="watchman-profile-panel">

        <h2>Profile Information</h2>

        <div className="watchman-profile-grid">
            <div>
  <span>Society</span>

  <strong>
    {loadingSociety
      ? 'Loading...'
      : society?.name || 'Not available'}
  </strong>
</div>

          <div>
            <span>Name</span>
            <strong>
              {user.name || 'Not available'}
            </strong>
          </div>

          <div>
            <span>Email</span>
            <strong>
              {user.email || 'Not available'}
            </strong>
          </div>

          <div>
            <span>Phone</span>
            <strong>
              {user.phone || 'Not provided'}
            </strong>
          </div>

          <div>
            <span>Duty location</span>
            <strong>
              {user.dutyLocation ||
                'Not assigned'}
            </strong>
          </div>

          <div>
            <span>Role</span>
            <strong>Watchman</strong>
          </div>

        </div>

      </div>

      {/* ACCOUNT SECURITY */}

      <div className="watchman-profile-panel">

        <h2>Account Security</h2>

        {mustChangePassword ? (
          <p>
            Your account is using a temporary
            password provided by your society admin.
            Please change it before continuing.
          </p>
        ) : (
          <p>
            Change your password to keep your
            SocioHub account secure.
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

        <form
          onSubmit={handleChangePassword}
          className="watchman-password-form"
        >

          <label>
            Current Password

            <input
              name="currentPassword"
              type="password"
              value={
                passwordForm.currentPassword
              }
              onChange={updatePasswordField}
              required
            />
          </label>

          <label>
            New Password

            <input
              name="newPassword"
              type="password"
              value={
                passwordForm.newPassword
              }
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
              value={
                passwordForm.confirmPassword
              }
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