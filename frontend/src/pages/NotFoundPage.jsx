import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div style={styles.page}>
      <h1 style={styles.code}>404</h1>
      <h2 style={styles.title}>Page Not Found</h2>
      <p style={styles.desc}>The fragrance or page you are looking for does not exist or has been moved.</p>
      <Link to="/" style={styles.btn}>Return to Boutique</Link>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'var(--ryox-bg)',
    backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(191,161,95,0.08), transparent 45%)',
    gap: '1rem', padding: '2rem',
  },
  code:  { fontSize: '6.5rem', fontWeight: '700', color: 'var(--ryox-gold-dark)', margin: 0, lineHeight: 1, fontFamily: 'var(--ryox-font-serif)' },
  title: { color: 'var(--ryox-text-heading)', fontSize: '1.8rem', fontWeight: '600', fontFamily: 'var(--ryox-font-serif)' },
  desc:  { color: 'var(--ryox-text-muted)', fontSize: '0.95rem', textAlign: 'center', maxWidth: '420px', lineHeight: 1.6 },
  btn: {
    marginTop: '1rem', padding: '0.95rem 2.2rem',
    background: 'var(--ryox-gold-gradient)', color: '#14120e',
    textDecoration: 'none', borderRadius: '8px',
    fontWeight: '700', fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase',
    boxShadow: '0 8px 25px rgba(191,161,95,0.35)',
  },
}

export default NotFoundPage