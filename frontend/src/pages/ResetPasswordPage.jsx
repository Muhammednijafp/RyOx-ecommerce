import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

function ResetPasswordPage() {
  const [password,  setPassword]  = useState('')
  const [password2, setPassword2] = useState('')
  const [loading,   setLoading]   = useState(false)
  const [success,   setSuccess]   = useState(false)
  const [searchParams]            = useSearchParams()
  const navigate                  = useNavigate()
  const token                     = searchParams.get('token')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password !== password2) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }
    setLoading(true)
    try {
      await api.post('/users/password-reset/confirm/', {
        token, password, password2
      })
      setSuccess(true)
      toast.success('Password reset successfully!')
      setTimeout(() => navigate('/login'), 3000)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Reset failed')
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={{ color: '#dc2626', textAlign: 'center', fontFamily: 'var(--ryox-font-serif)', marginBottom: '1rem' }}>Invalid Reset Link</h2>
          <p style={{ color: 'var(--ryox-text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" style={styles.btn}>Request New Link</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.header}>
          <img
            src="/image/ryox-logo.png"
            alt="RyOx"
            style={styles.logoImage}
          />
          <p style={styles.subtitle}>MAISON DE PARFUM</p>
        </div>

        {success ? (
          <div style={styles.successBox}>
            <span style={styles.successIcon}>✅</span>
            <h2 style={styles.successTitle}>Password Reset!</h2>
            <p style={styles.successDesc}>
              Your password has been reset successfully.
              Redirecting to login in 3 seconds...
            </p>
            <Link to="/login" style={styles.btn}>Go to Login</Link>
          </div>
        ) : (
          <>
            <h2 style={styles.title}>Set New Password</h2>
            <p style={styles.desc}>Enter your new secure password below.</p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  style={styles.input}
                  autoComplete="new-password"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Confirm Password</label>
                <input
                  type="password"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  style={styles.input}
                  autoComplete="new-password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={loading ? styles.btnDisabled : styles.btn}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'var(--ryox-bg)',
    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(191,161,95,0.08), transparent 45%)',
    padding: '2rem',
  },
  card: {
    backgroundColor: '#ffffff', border: '1px solid var(--ryox-divider)',
    borderRadius: '18px', padding: '2.5rem',
    width: '100%', maxWidth: '420px',
    boxShadow: 'var(--ryox-shadow-md)',
  },
  header: { textAlign: 'center', marginBottom: '1.4rem' },
  logoImage: {
    width: '160px',
    height: 'auto',
    display: 'block',
    margin: '0 auto',
    objectFit: 'contain',
    filter: 'drop-shadow(0 2px 8px rgba(191,161,95,0.15))',
  },
  subtitle: { color: 'var(--ryox-gold-dark)', fontSize: '0.68rem', margin: '0.5rem 0 0', letterSpacing: '3px', textTransform: 'uppercase', fontWeight: '700' },
  title: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.6rem', fontWeight: '600', marginBottom: '0.4rem', textAlign: 'center' },
  desc: { color: 'var(--ryox-text-muted)', fontSize: '0.9rem', marginBottom: '1.8rem', textAlign: 'center' },

  form: { display: 'flex', flexDirection: 'column', gap: '1.1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  label: { color: 'var(--ryox-text-heading)', fontSize: '0.82rem', fontWeight: '600' },
  input: {
    padding: '0.85rem 1rem', backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)', borderRadius: '8px',
    color: 'var(--ryox-text-heading)', fontSize: '0.92rem', outline: 'none',
    boxShadow: 'var(--ryox-shadow-sm)',
  },
  btn: {
    display: 'block', textAlign: 'center',
    padding: '0.95rem', background: 'var(--ryox-gold-gradient)',
    color: '#14120e', border: 'none', borderRadius: '8px',
    fontSize: '0.85rem', fontWeight: '700', cursor: 'pointer',
    marginTop: '0.5rem', letterSpacing: '1.5px', textTransform: 'uppercase',
    textDecoration: 'none', boxShadow: '0 8px 25px rgba(191,161,95,0.35)',
  },
  btnDisabled: {
    padding: '0.95rem', backgroundColor: '#e5dfd5',
    color: '#a39b90', border: 'none', borderRadius: '8px',
    fontSize: '0.85rem', fontWeight: '700', cursor: 'not-allowed',
    marginTop: '0.5rem', letterSpacing: '1.5px', textTransform: 'uppercase',
  },

  successBox: { textAlign: 'center', padding: '1rem 0' },
  successIcon: { fontSize: '3rem', display: 'block', marginBottom: '1rem' },
  successTitle: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.4rem', fontWeight: '600', marginBottom: '0.8rem' },
  successDesc: { color: 'var(--ryox-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' },
}

export default ResetPasswordPage