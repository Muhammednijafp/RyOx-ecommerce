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
      const cleanEmail = (email || '').trim().toLowerCase()
      const res = await loginUser({ email: cleanEmail, password })
      localStorage.setItem('access_token',  res.data.access)
      localStorage.setItem('refresh_token', res.data.refresh)
      const profile = await getProfile()
      set({ user: profile.data, isAuthenticated: true, loading: false })
      return { success: true }
    } catch (err) {
      set({ loading: false })
      const data = err.response?.data
      let errorMsg = 'Login failed. Please check your credentials.'
      if (data) {
        if (data.detail === 'No active account found with the given credentials') {
          errorMsg = 'Invalid email or password. Please check your credentials or register.'
        } else if (typeof data.detail === 'string') {
          errorMsg = data.detail
        } else if (Array.isArray(data.non_field_errors)) {
          errorMsg = data.non_field_errors.join(' ')
        } else if (typeof data === 'object') {
          const firstVal = Object.values(data)[0]
          if (Array.isArray(firstVal)) {
            errorMsg = firstVal.join(' ')
          } else if (typeof firstVal === 'string') {
            errorMsg = firstVal
          }
        }
      }
      return { success: false, error: errorMsg }
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