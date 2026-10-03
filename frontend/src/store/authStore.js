import { create } from 'zustand'
import { loginUser, logoutUser, getProfile } from '../api/auth'

const useAuthStore = create((set, get) => ({
  user:          null,
  isAuthenticated: false,
  loading:       false,

  // login
  login: async (email, password) => {
    set({ loading: true })
    try {
      const res = await loginUser({ email, password })
      localStorage.setItem('access_token',  res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      const profile = await getProfile()
      set({ user: profile.data, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (err) {
      set({ loading: false })
      return { success: false, error: err.response?.data?.detail || 'Login failed' }
    }
  },

  // logout
  logout: async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      await logoutUser({ refresh })
    } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    set({ user: null, isAuthenticated: false })
  },

  // load user on app start
  loadUser: async () => {
    const token = localStorage.getItem('access_token')
    if (!token) return
    try {
      const profile = await getProfile()
      set({ user: profile.data, isAuthenticated: true })
    } catch {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
  },
}))

export default useAuthStore