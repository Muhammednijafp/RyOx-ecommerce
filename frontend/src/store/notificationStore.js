import { create } from 'zustand'
import {
  getNotifications, getUnreadCount,
  markAsRead, markAllRead
} from '../api/notifications'

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount:   0,
  loading:       false,

  // fetch all notifications (handles both array and DRF paginated responses)
  fetchNotifications: async () => {
    set({ loading: true })
    try {
      const res = await getNotifications()
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || [])
      set({ notifications: list, loading: false })
    } catch {
      set({ loading: false })
    }
  },

  // fetch unread count only
  fetchUnreadCount: async () => {
    try {
      const res = await getUnreadCount()
      const count = typeof res.data === 'number' ? res.data : (res.data?.unread_count ?? res.data?.count ?? 0)
      set({ unreadCount: count })
    } catch {}
  },

  // mark single as read
  markRead: async (id) => {
    try {
      await markAsRead(id)
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }))
    } catch {}
  },

  // mark all as read
  markAllAsRead: async () => {
    try {
      await markAllRead()
      set((state) => ({
        notifications: Array.isArray(state.notifications)
          ? state.notifications.map((n) => ({ ...n, is_read: true }))
          : [],
        unreadCount: 0,
      }))
    } catch {}
  },
}))

export default useNotificationStore