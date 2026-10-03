import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import useCartStore from '../store/cartStore'
import useWishlistStore from '../store/wishlistStore'
import toast from 'react-hot-toast'

function LoginPage() {
  const [email, setEmail] = useState(
    () => localStorage.getItem('savedLoginEmail') || ''
  )
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSavePrompt, setShowSavePrompt] = useState(false)

  const { login } = useAuthStore()
  const { fetchCart } = useCartStore()
  const { fetchWishlist } = useWishlistStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(email, password)

    if (result.success) {
      await fetchCart()
      await fetchWishlist()

      toast.success('Welcome back to RyOx!')

      // Show save-login-details confirmation
      setShowSavePrompt(true)
    } else {
      toast.error(result.error)
    }

    setLoading(false)
  }

  const handleSaveLogin = () => {
    localStorage.setItem('savedLoginEmail', email)
    setShowSavePrompt(false)
    navigate('/')
  }

  const handleNotNow = () => {
    localStorage.removeItem('savedLoginEmail')
    setShowSavePrompt(false)
    navigate('/')
  }

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

        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.desc}>
          Sign in to continue your fragrance journey
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={loading ? styles.btnDisabled : styles.btn}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={styles.forgotLink}>
          <Link to="/forgot-password" style={styles.link}>
            Forgot Password?
          </Link>
        </p>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={styles.link}>
            Create one
          </Link>
        </p>
      </div>

      {/* Save Login Prompt */}
      {showSavePrompt && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>🔐</div>

            <h3 style={styles.modalTitle}>
              Save login details?
            </h3>

            <p style={styles.modalText}>
              Would you like to save your email for your next visit?
            </p>

            <div style={styles.modalButtons}>
              <button
                onClick={handleNotNow}
                style={styles.notNowBtn}
              >
                Not now
              </button>

              <button
                onClick={handleSaveLogin}
                style={styles.saveBtn}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
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
    padding: '2rem',
  },

  card: {
    backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '18px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
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
    boxShadow: 'var(--ryox-shadow-sm)',
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

  forgotLink: {
    textAlign: 'right',
    marginTop: '0.8rem',
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

  // Save Login Modal
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem',
  },

  modal: {
    width: '100%',
    maxWidth: '380px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '16px',
    padding: '2.2rem',
    textAlign: 'center',
    boxShadow: 'var(--ryox-shadow-lg)',
  },

  modalIcon: {
    fontSize: '2.2rem',
    marginBottom: '0.8rem',
  },

  modalTitle: {
    color: 'var(--ryox-text-heading)',
    fontFamily: 'var(--ryox-font-serif)',
    fontSize: '1.25rem',
    margin: '0 0 0.7rem',
  },

  modalText: {
    color: 'var(--ryox-text-muted)',
    fontSize: '0.9rem',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
  },

  modalButtons: {
    display: 'flex',
    gap: '0.8rem',
  },

  notNowBtn: {
    flex: 1,
    padding: '0.8rem',
    backgroundColor: 'transparent',
    color: 'var(--ryox-text-muted)',
    border: '1px solid var(--ryox-divider)',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '600',
    cursor: 'pointer',
  },

  saveBtn: {
    flex: 1,
    padding: '0.8rem',
    background: 'var(--ryox-gold-gradient)',
    color: '#14120e',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.88rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
}

export default LoginPage