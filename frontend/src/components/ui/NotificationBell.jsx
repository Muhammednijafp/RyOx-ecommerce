import { useEffect, useRef, useState } from 'react'
import { Bell, X, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import useNotificationStore from '../../store/notificationStore'
import useAuthStore from '../../store/authStore'

function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  const { isAuthenticated } = useAuthStore()
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    fetchUnreadCount,
    markRead,
    markAllAsRead,
  } = useNotificationStore()

  // fetch unread count every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return
    fetchUnreadCount()
    const interval = setInterval(fetchUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [isAuthenticated])

  // fetch notifications when dropdown opens
  useEffect(() => {
    if (open && isAuthenticated) fetchNotifications()
  }, [open])

  // close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  if (!isAuthenticated) return null

  const typeIcon = (type) => {
    const icons = {
      order: '📦',
      promo: '🎁',
      review: '⭐',
      system: '🔔',
      wishlist: '❤️',
    }
    return icons[type] || '🔔'
  }

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return `${Math.floor(diff / 86400)}d ago`
  }

  return (
    <div style={styles.wrap} ref={ref}>
      {/* Bell Icon */}
      <button
        style={styles.bell}
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
      >
        <Bell size={19} color="#2b2621" strokeWidth={1.8} />
        {unreadCount > 0 && (
          <span style={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={styles.dropdown}>
          {/* Header */}
          <div style={styles.dropHeader}>
            <h3 style={styles.dropTitle}>Notifications</h3>
            <div style={styles.dropActions}>
              {unreadCount > 0 && (
                <button style={styles.markAllBtn} onClick={markAllAsRead}>
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button style={styles.closeBtn} onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
          </div>

          {/* List */}
          <div style={styles.list}>
            {notifications.length === 0 ? (
              <div style={styles.empty}>
                <Bell size={32} color="#bfa15f" opacity={0.5} />
                <p style={styles.emptyText}>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 8).map((notif) => (
                <div
                  key={notif.id}
                  style={{
                    ...styles.notifItem,
                    backgroundColor: notif.is_read ? 'transparent' : 'rgba(191, 161, 95, 0.08)',
                    borderLeft: notif.is_read
                      ? '3px solid transparent'
                      : '3px solid #bfa15f',
                  }}
                  onClick={() => {
                    if (!notif.is_read) markRead(notif.id)
                    if (notif.type === 'order') {
                      setOpen(false)
                      navigate('/orders')
                    }
                  }}
                >
                  <span style={styles.notifIcon}>{typeIcon(notif.type)}</span>
                  <div style={styles.notifContent}>
                    <p style={styles.notifTitle}>{notif.title}</p>
                    <p style={styles.notifMsg}>{notif.message}</p>
                    <p style={styles.notifTime}>{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.is_read && <div style={styles.unreadDot} />}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div style={styles.dropFooter}>
              <button
                style={styles.viewAllBtn}
                onClick={() => {
                  setOpen(false)
                  navigate('/notifications')
                }}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const styles = {
  wrap: { position: 'relative' },

  bell: {
    position: 'relative',
    width: '38px',
    height: '38px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    borderRadius: '50%',
    cursor: 'pointer',
    padding: 0,
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.25s ease',
  },

  badge: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    background: 'var(--ryox-gold-gradient)',
    color: '#14120e',
    borderRadius: '50%',
    minWidth: '17px',
    height: '17px',
    padding: '0 4px',
    fontSize: '0.62rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '800',
    border: '2px solid #fdfbf7',
    boxShadow: '0 2px 6px rgba(191, 161, 95, 0.35)',
  },

  dropdown: {
    position: 'absolute',
    top: '140%',
    right: 0,
    width: '340px',
    backgroundColor: '#ffffff',
    border: '1px solid rgba(191, 161, 95, 0.25)',
    borderRadius: '14px',
    boxShadow: '0 12px 35px rgba(0, 0, 0, 0.1)',
    zIndex: 3000,
    overflow: 'hidden',
  },

  dropHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.1rem 1.3rem',
    borderBottom: '1px solid #ede8df',
    background: '#fcfaf6',
  },

  dropTitle: {
    color: '#1a1714',
    fontFamily: 'var(--ryox-font-serif)',
    fontSize: '0.98rem',
    fontWeight: '600',
    margin: 0,
  },

  dropActions: { display: 'flex', alignItems: 'center', gap: '0.6rem' },

  markAllBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#bfa15f',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '0.3rem',
  },

  closeBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#888',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },

  list: { maxHeight: '380px', overflowY: 'auto' },

  empty: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2.8rem 1.5rem',
    gap: '0.8rem',
  },

  emptyText: { color: '#8c847a', fontSize: '0.88rem' },

  notifItem: {
    display: 'flex',
    gap: '0.8rem',
    padding: '1rem 1.3rem',
    cursor: 'pointer',
    alignItems: 'flex-start',
    borderBottom: '1px solid #f2ede4',
    transition: 'background 0.2s ease',
  },

  notifIcon: { fontSize: '1.2rem', flexShrink: 0, marginTop: '0.1rem' },
  notifContent: { flex: 1, minWidth: 0 },

  notifTitle: {
    color: '#1a1714',
    fontSize: '0.88rem',
    fontWeight: '600',
    marginBottom: '0.2rem',
  },

  notifMsg: {
    color: '#6b645c',
    fontSize: '0.82rem',
    lineHeight: 1.4,
    marginBottom: '0.3rem',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  notifTime: { color: '#a39b90', fontSize: '0.72rem' },

  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#bfa15f',
    flexShrink: 0,
    marginTop: '0.4rem',
  },

  dropFooter: {
    borderTop: '1px solid #ede8df',
    padding: '0.8rem 1.3rem',
    background: '#fcfaf6',
  },

  viewAllBtn: {
    width: '100%',
    backgroundColor: 'transparent',
    border: '1px solid rgba(191, 161, 95, 0.4)',
    color: '#8f7234',
    padding: '0.65rem',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.82rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    transition: 'all 0.25s ease',
  },
}

export default NotificationBell