import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { apiRequest } from '../services/api'
import './login.css'

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [form, setForm] = useState({
    email: '',
    password: ''
  })

  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setError('')

    try {
      const result = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(form)
      })

      localStorage.setItem('sociohub_token', result.token)
      localStorage.setItem(
        'sociohub_user',
        JSON.stringify(result.user)
      )

      if (result.user.societyId) {
        localStorage.setItem(
          'sociohub_society_id',
          result.user.societyId
        )
      }

   // Force residents to change their temporary password
if (
  (result.user.role === 'OWNER' ||
    result.user.role === 'TENANT') &&
  result.user.mustChangePassword
) {
  navigate('/resident/profile?changePassword=1')
  return
}

// Redirect according to role
if (result.user.role === 'ADMIN') {
  navigate('/admin/dashboard')
} else if (
  result.user.role === 'OWNER' ||
  result.user.role === 'TENANT'
) {
  navigate('/resident')
} else if (result.user.role === 'WATCHMAN') {
  navigate('/watchman')
} else {
  navigate('/')
}

    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="login-page">

      <div className="login-card">

        <Link className="auth-close" to="/" aria-label="Return to home" title="Return to home">
          <span aria-hidden="true">×</span>
        </Link>

        <strong className="login-brand">
          Socio<span>Hub</span>
        </strong>

        <p className="page-kicker">
          Community access
        </p>

        <h1>Welcome back</h1>

        <p>
          Sign in to access your society space.
        </p>

        {searchParams.get('registered') && (
          <div className="success-message">
            Registration successful. You can now sign in.
          </div>
        )}

        {error && (
          <div className="form-error">
            {error}
          </div>
        )}

        <form onSubmit={submit}>

          <label>
            Email

            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({
                  ...form,
                  email: event.target.value
                })
              }
              required
            />
          </label>

          <label>
            Password

            <input
              type="password"
              value={form.password}
              onChange={(event) =>
                setForm({
                  ...form,
                  password: event.target.value
                })
              }
              required
            />
          </label>

          <button
            className="primary-button"
            type="submit"
          >
            Sign in
          </button>

        </form>

        <p className="login-switch">
          New to SocioHub?{' '}
          <Link to="/register">
            Create an account
          </Link>
        </p>

      </div>

    </main>
  )
}
