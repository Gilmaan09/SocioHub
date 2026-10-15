import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { apiRequest } from '../services/api'
import './login.css'

export default function Register() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    societyName: '',
    societyAddress: '',
    societyEmail: '',
    societyPhone: '',

    adminName: '',
    adminEmail: '',
    adminPhone: '',
    password: '',
    confirmPassword: ''
  })

  const [error, setError] = useState('')


  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value
    })
  }


  async function submit(event) {
    event.preventDefault()
    setError('')


    // Check passwords
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }


    try {
      await apiRequest('/auth/register-society', {
        method: 'POST',

        body: JSON.stringify({
          societyName: form.societyName,
          societyAddress: form.societyAddress,
          societyEmail: form.societyEmail,
          societyPhone: form.societyPhone,

          adminName: form.adminName,
          adminEmail: form.adminEmail,
          adminPhone: form.adminPhone,
          password: form.password
        })
      })


      // Registration successful
      navigate('/login?registered=1')

    } catch (requestError) {
      setError(requestError.message)
    }
  }


  return (
    <main className="login-page">

      <div className="login-card register-card">

        <strong className="login-brand">
          Socio<span>Hub</span>
        </strong>

        <p className="page-kicker">
          Society onboarding
        </p>

        <h1>Register Your Society</h1>

        <p>
          Create your society and first administrator account.
        </p>


        {error && (
          <div className="form-error">
            {error}
          </div>
        )}


        <form onSubmit={submit}>

          <h3>Society Details</h3>


          <label>
            Society Name

            <input
              type="text"
              name="societyName"
              value={form.societyName}
              onChange={updateField}
              required
            />
          </label>


          <label>
            Society Address

            <textarea
              name="societyAddress"
              value={form.societyAddress}
              onChange={updateField}
              required
            />
          </label>


          <label>
            Society Contact Email

            <input
              type="email"
              name="societyEmail"
              value={form.societyEmail}
              onChange={updateField}
            />
          </label>


          <label>
            Society Contact Phone

            <input
              type="tel"
              name="societyPhone"
              value={form.societyPhone}
              onChange={updateField}
            />
          </label>


          <h3>First Admin Account</h3>


          <label>
            Admin Name

            <input
              type="text"
              name="adminName"
              value={form.adminName}
              onChange={updateField}
              required
            />
          </label>


          <label>
            Admin Email

            <input
              type="email"
              name="adminEmail"
              value={form.adminEmail}
              onChange={updateField}
              required
            />
          </label>


          <label>
            Admin Phone

            <input
              type="tel"
              name="adminPhone"
              value={form.adminPhone}
              onChange={updateField}
            />
          </label>


          <label>
            Password

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              required
              minLength={6}
            />
          </label>


          <label>
            Confirm Password

            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={updateField}
              required
              minLength={6}
            />
          </label>


          <button
            className="primary-button"
            type="submit"
          >
            Register Society
          </button>

        </form>


        <p className="login-switch">
          Already have an account?{' '}
          <Link to="/login">
            Sign in
          </Link>
        </p>

      </div>

    </main>
  )
}


// import { useState } from 'react'
// import { Link, useNavigate } from 'react-router-dom'
// import { apiRequest } from '../services/api'
// import './login.css'

// export default function Register() {
//   const navigate = useNavigate()
//   const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'OWNER', adminSetupKey: '' })
//   const [error, setError] = useState('')

//   function updateField(event) {
//     setForm({ ...form, [event.target.name]: event.target.value })
//   }

//   async function submit(event) {
//     event.preventDefault()
//     setError('')
//     try {
//       await apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(form) })
//       navigate('/login?registered=1')
//     } catch (requestError) {
//       setError(requestError.message)
//     }
//   }

//   return <main className="login-page"><div className="login-card register-card"><strong className="login-brand">Socio<span>Hub</span></strong><p className="page-kicker">Join your community</p><h1>Create account</h1><p>Choose your role. Owners and tenants can register directly; admins need the private setup key.</p>{error && <div className="form-error">{error}</div>}<form onSubmit={submit}><label>Full name<input name="name" value={form.name} onChange={updateField} required /></label><label>Email<input name="email" type="email" value={form.email} onChange={updateField} required /></label><label>Phone<input name="phone" value={form.phone} onChange={updateField} /></label><label>I am a<select name="role" value={form.role} onChange={updateField}><option value="OWNER">Owner</option><option value="TENANT">Tenant</option><option value="ADMIN">Admin</option></select></label>{form.role === 'ADMIN' && <label>Admin setup key<input name="adminSetupKey" type="password" value={form.adminSetupKey} onChange={updateField} required /></label>}<label>Password<input name="password" type="password" minLength="6" value={form.password} onChange={updateField} required /></label><button className="primary-button" type="submit">Create account</button></form><p className="login-switch">Already have an account? <Link to="/login">Sign in</Link></p></div></main>
// }
