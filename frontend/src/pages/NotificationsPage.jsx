import { useEffect } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import useNotificationStore from '../store/notificationStore'

function NotificationsPage() {
  const { notifications, unreadCount, loading,
          fetchNotifications, markRead, markAllAsRead } = useNotificationStore()

  useEffect(() => {
    fetchNotifications()
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const typeIcon = (type) => {
    const icons = {
      order:    '📦',
      promo:    '🎁',
      review:   '⭐',
      system:   '🔔',
      wishlist: '❤️',
    }
    return icons[type] || '🔔'
  }

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000)
    if (diff < 60)    return 'just now'
    if (diff < 3600)  return `${Math.floor(diff / 60)} minutes ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
    return `${Math.floor(diff / 86400)} days ago`
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Notifications</h1>
          <p style={styles.count}>
            {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button style={styles.markAllBtn} onClick={markAllAsRead}>
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <div style={styles.empty}>
          <Bell size={56} color="#bfa15f" opacity={0.5} />
          <h2 style={styles.emptyTitle}>No notifications yet</h2>
          <p style={styles.emptyDesc}>We will notify you about your order dispatches, offers, and fragrance updates here.</p>
        </div>
      ) : (
        <div style={styles.list}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                ...styles.card,
                backgroundColor: notif.is_read ? '#ffffff' : 'rgba(191,161,95,0.06)',
                borderLeft:      notif.is_read ? '4px solid var(--ryox-divider)' : '4px solid #bfa15f',
              }}
              onClick={() => { if (!notif.is_read) markRead(notif.id) }}
            >
              <span style={styles.icon}>{typeIcon(notif.type)}</span>
              <div style={styles.content}>
                <div style={styles.cardHeader}>
                  <p style={styles.cardTitle}>{notif.title}</p>
                  <span style={styles.time}>{timeAgo(notif.created_at)}</span>
                </div>
                <p style={styles.message}>{notif.message}</p>
                {!notif.is_read && (
                  <span style={styles.unreadBadge}>New</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  page:    { backgroundColor: 'var(--ryox-bg)', minHeight: '100vh', padding: '3rem 2rem 5rem', maxWidth: '880px', margin: '0 auto', color: 'var(--ryox-text)' },
  loading: { color: 'var(--ryox-text-muted)', textAlign: 'center', padding: '6rem', fontSize: '1.1rem' },

  header: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   '2.5rem',
    flexWrap:       'wrap',
    gap:            '1rem',
    paddingBottom:  '1.2rem',
    borderBottom:   '1px solid var(--ryox-divider)',
  },
  title: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '2.4rem', fontWeight: '500', marginBottom: '0.3rem' },
  count: { color: 'var(--ryox-text-muted)', fontSize: '0.9rem' },
  markAllBtn: {
    display:         'flex',
    alignItems:      'center',
    gap:             '0.5rem',
    backgroundColor: '#ffffff',
    border:          '1px solid var(--ryox-gold-border)',
    color:           'var(--ryox-gold-dark)',
    padding:         '0.6rem 1.2rem',
    borderRadius:    '8px',
    cursor:          'pointer',
    fontSize:        '0.82rem',
    fontWeight:      '700',
    boxShadow:       'var(--ryox-shadow-sm)',
  },

  empty: {
    display:        'flex',
    flexDirection:  'column',
    alignItems:     'center',
    justifyContent: 'center',
    minHeight:      '60vh',
    gap:            '1.2rem',
    textAlign:      'center',
  },
  emptyTitle: { color: 'var(--ryox-text-heading)', fontFamily: 'var(--ryox-font-serif)', fontSize: '1.8rem', fontWeight: '500' },
  emptyDesc:  { color: 'var(--ryox-text-muted)', fontSize: '0.95rem', maxWidth: '420px' },

  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },

  card: {
    display:      'flex',
    gap:          '1.2rem',
    padding:      '1.4rem',
    borderRadius: '14px',
    cursor:       'pointer',
    alignItems:   'flex-start',
    border:       '1px solid var(--ryox-divider)',
    boxShadow:    'var(--ryox-shadow-sm)',
    transition:   'transform 0.2s ease, box-shadow 0.2s ease',
  },
  icon:    { fontSize: '1.6rem', flexShrink: 0, marginTop: '0.1rem' },
  content: { flex: 1 },
  cardHeader: {
    display:        'flex',
    justifyContent: 'space-between',
    alignItems:     'flex-start',
    marginBottom:   '0.4rem',
    gap:            '1rem',
  },
  cardTitle: { color: 'var(--ryox-text-heading)', fontSize: '1rem', fontWeight: '600', margin: 0 },
  time:      { color: 'var(--ryox-text-subtle)', fontSize: '0.8rem', flexShrink: 0 },
  message:   { color: 'var(--ryox-text)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '0.5rem' },
  unreadBadge: {
    backgroundColor: '#bfa15f',
    color:           '#14120e',
    fontSize:        '0.68rem',
    fontWeight:      '800',
    padding:         '0.2rem 0.65rem',
    borderRadius:    '20px',
    letterSpacing:   '1px',
    textTransform:   'uppercase',
  },
}

export default NotificationsPage