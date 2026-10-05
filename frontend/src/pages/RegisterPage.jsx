import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../api/auth'
import toast from 'react-hot-toast'

function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    full_name: '',
    phone: '',
    password: '',
    password2: '',
  })

  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validateEmail = (email) => {
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/
    return emailRegex.test(email)
  }

  const validateFullName = (name) => {
    return (
      name.length >= 2 &&
      name.length <= 100 &&
      /^[A-Za-z\s.'-]+$/.test(name.trim())
    )
  }

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.'
    }
    if (!/^[A-Z]/.test(password)) {
      return 'Password must start with a capital letter.'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number.'
    }
    if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/;'`~+=]/.test(password)) {
      return 'Password must contain at least one special character.'
    }
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'phone') {
      const onlyDigits = value.replace(/\D/g, '').slice(0, 10)
      setForm({ ...form, phone: onlyDigits })
      return
    }
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const cleanName = form.full_name.trim()
    const cleanEmail = form.email.trim().toLowerCase()
    const cleanPhone = form.phone.replace(/\D/g, '').slice(-10)

    if (!cleanName || !validateFullName(cleanName)) {
      toast.error('Please enter a valid full name.')
      return
    }
    if (!cleanEmail || !validateEmail(cleanEmail)) {
      toast.error('Please enter a valid email address.')
      return
    }
    if (!cleanPhone || cleanPhone.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!form.password) {
      toast.error('Please enter a password.')
      return
    }

    const passwordError = validatePassword(form.password)
    if (passwordError) {
      toast.error(passwordError)
      return
    }

    if (form.password !== form.password2) {
      toast.error('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await registerUser({
        ...form,
        full_name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
      })

      toast.success('Account created! Welcome to RyOx.')
      navigate('/login')
    } catch (err) {
      const errors = err.response?.data
      if (errors) {
        Object.values(errors).forEach((msg) => {
          if (Array.isArray(msg)) {
            msg.forEach((message) => toast.error(message))
          } else {
            toast.error(String(msg))
          }
        })
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const passwordHasMinLength = form.password.length >= 8
  const passwordStartsUppercase = /^[A-Z]/.test(form.password)
  const passwordHasNumber = /[0-9]/.test(form.password)
  const passwordHasSymbol =
    /[!@#$%^&*(),.?":{}|<>_\-\\[\]\/;'`~+=]/.test(form.password)

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Header */}
        <div style={styles.header}>
          <img
            src="/image/ryox-logo.png"
            alt="RyOx"
            style={styles.logoImage}
          />
          <p style={styles.subtitle}>MAISON DE PARFUM</p>
        </div>

        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.desc}>
          Join RyOx and explore rare haute fragrances
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Full Name */}
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Your full name"
              required
              maxLength={100}
              autoComplete="name"
              style={styles.input}
            />
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={styles.input}
            />
            {form.email && !validateEmail(form.email) && (
              <p style={styles.errorText}>Please enter a valid email address.</p>
            )}
          </div>

          {/* Phone */}
          <div style={styles.field}>
            <label style={styles.label}>Phone Number</label>
            <div style={styles.phoneGroup}>
              <span style={styles.phonePrefix}>🇮🇳 +91</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                maxLength={10}
                style={styles.phoneInput}
                autoComplete="tel-national"
              />
            </div>
            {form.phone && form.phone.length > 0 && form.phone.length < 10 && (
              <p style={styles.hintText}>{10 - form.phone.length} more digits needed</p>
            )}
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Create a secure password"
              required
              autoComplete="new-password"
              style={styles.input}
            />

            {/* Password Requirements Checklist */}
            <div style={styles.passwordRules}>
              <p style={styles.rulesTitle}>Password must contain:</p>
              <p style={passwordHasMinLength ? styles.ruleValid : styles.rule}>
                {passwordHasMinLength ? '✓' : '•'} At least 8 characters
              </p>
              <p style={passwordStartsUppercase ? styles.ruleValid : styles.rule}>
                {passwordStartsUppercase ? '✓' : '•'} Start with a capital letter
              </p>
              <p style={passwordHasNumber ? styles.ruleValid : styles.rule}>
                {passwordHasNumber ? '✓' : '•'} Include at least one number
              </p>
              <p style={passwordHasSymbol ? styles.ruleValid : styles.rule}>
                {passwordHasSymbol ? '✓' : '•'} Include at least one special character
              </p>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={styles.field}>
            <label style={styles.label}>Confirm Password</label>
            <input
              type="password"
              name="password2"
              value={form.password2}
              onChange={handleChange}
              placeholder="Repeat your password"
              required
              autoComplete="new-password"
              style={styles.input}
            />
            {form.password2 && (
              <p style={form.password === form.password2 ? styles.validHint : styles.errorText}>
                {form.password === form.password2 ? '✓ Passwords match' : 'Passwords do not match'}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={loading ? styles.btnDisabled : styles.btn}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Login Link */}
        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--ryox-bg)',
    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(191,161,95,0.08), transparent 45%)',
    padding: '3rem 2rem',
  },

  card: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '18px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '440px',
    boxShadow: 'var(--ryox-shadow-md)',
  },

  header: {
    textAlign: 'center',
    marginBottom: '1.4rem',
  },

  logoImage: {
    width: '160px',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 8px rgba(191,161,95,0.15))',
  },

  subtitle: {
    color: 'var(--ryox-gold-dark)',
    fontSize: '0.68rem',
    fontWeight: '700',
    margin: '0.5rem 0 0',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },

  title: {
    color: 'var(--ryox-text-heading)',
    fontFamily: 'var(--ryox-font-serif)',
    fontSize: '1.6rem',
    fontWeight: '600',
    marginBottom: '0.4rem',
    textAlign: 'center',
  },

  desc: {
    color: 'var(--ryox-text-muted)',
    fontSize: '0.88rem',
    marginBottom: '1.8rem',
    textAlign: 'center',
  },

  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.1rem',
  },

  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },

  label: {
    color: 'var(--ryox-text-heading)',
    fontSize: '0.82rem',
    fontWeight: '600',
  },

  input: {
    padding: '0.85rem 1rem',
    backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '8px',
    color: 'var(--ryox-text-heading)',
    fontSize: '0.92rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    boxShadow: 'var(--ryox-shadow-sm)',
  },

  phoneGroup: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '8px',
    boxShadow: 'var(--ryox-shadow-sm)',
    overflow: 'hidden',
  },

  phonePrefix: {
    padding: '0.85rem 0.9rem',
    backgroundColor: 'var(--ryox-surface-subtle)',
    borderRight: '1px solid var(--ryox-divider)',
    color: 'var(--ryox-text-heading)',
    fontSize: '0.88rem',
    fontWeight: '600',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },

  phoneInput: {
    flex: 1,
    padding: '0.85rem 1rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--ryox-text-heading)',
    fontSize: '0.92rem',
    outline: 'none',
    letterSpacing: '1px',
    width: '100%',
    boxSizing: 'border-box',
  },

  hintText: {
    color: 'var(--ryox-text-muted)',
    fontSize: '0.75rem',
    margin: '0',
    fontStyle: 'italic',
  },

  validHint: {
    color: '#2e7d32',
    fontSize: '0.75rem',
    margin: '0',
    fontWeight: '600',
  },

  errorText: {
    color: '#dc2626',
    fontSize: '0.75rem',
    margin: '0',
    fontWeight: '600',
  },

  passwordRules: {
    backgroundColor: 'var(--ryox-surface-subtle)',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '8px',
    padding: '0.9rem 1rem',
    marginTop: '0.3rem',
  },

  rulesTitle: {
    color: 'var(--ryox-text-heading)',
    fontSize: '0.78rem',
    margin: '0 0 0.5rem',
    fontWeight: '700',
  },

  rule: {
    color: 'var(--ryox-text-muted)',
    fontSize: '0.74rem',
    margin: '0.25rem 0',
  },

  ruleValid: {
    color: '#2e7d32',
    fontSize: '0.74rem',
    margin: '0.25rem 0',
    fontWeight: '700',
  },

  btn: {
    padding: '0.95rem',
    background: 'var(--ryox-gold-gradient)',
    color: '#14120e',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    boxShadow: '0 8px 25px rgba(191, 161, 95, 0.35)',
  },

  btnDisabled: {
    padding: '0.95rem',
    backgroundColor: '#e5dfd5',
    color: '#a39b90',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '700',
    cursor: 'not-allowed',
    marginTop: '0.5rem',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
  },

  footer: {
    textAlign: 'center',
    color: 'var(--ryox-text-muted)',
    fontSize: '0.88rem',
    marginTop: '1.5rem',
  },

  link: {
    color: 'var(--ryox-gold-dark)',
    textDecoration: 'none',
    fontWeight: '700',
  },
}

export default RegisterPage