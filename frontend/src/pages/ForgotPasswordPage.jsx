import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/users/password-reset/', { email })
      setSent(true)
      toast.success('Reset link sent!')
    } catch {
      toast.error('Something went wrong')
    }
    setLoading(false)
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

        {sent ? (
          <div style={styles.successBox}>
            <span style={styles.successIcon}>📧</span>
            <h2 style={styles.successTitle}>Check Your Email</h2>
            <p style={styles.successDesc}>
              We sent a password reset link to <strong style={{ color: 'var(--ryox-gold-dark)' }}>{email}</strong>.
              It expires in 15 minutes.
            </p>
            <Link to="/login" style={styles.btn}>Back to Login</Link>
          </div>
        ) : (
          <>
            <h2 style={styles.title}>Forgot Password?</h2>
            <p style={styles.desc}>
              Enter your registered email and we'll send you a password reset link.
            </p>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  style={styles.input}
                  autoComplete="email"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                style={loading ? styles.btnDisabled : styles.btn}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p style={styles.footer}>
              Remember your password?{' '}
              <Link to="/login" style={styles.link}>Sign in</Link>
            </p>
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
  desc: { color: 'var(--ryox-text-muted)', fontSize: '0.9rem', marginBottom: '1.8rem', lineHeight: 1.6, textAlign: 'center' },

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
  footer: { textAlign: 'center', color: 'var(--ryox-text-muted)', fontSize: '0.88rem', marginTop: '1.5rem' },
  link: { color: 'var(--ryox-gold-dark)', textDecoration: 'none', fontWeight: '700' },

  successBox: { textAlign: 'center', padding: '1rem 0' },
  successIcon: { fontSize: '3rem', display: 'block', marginBottom: '1rem' },
  successTitle: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.4rem', fontWeight: '600', marginBottom: '0.8rem' },
  successDesc: { color: 'var(--ryox-text-muted)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '2rem' },
}

export default ForgotPasswordPage