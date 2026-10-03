import api from './axios'

export const applyCoupon = (code, cart_total) =>
  api.post('/coupons/apply/', { code, cart_total })

export const validateCoupon = (code) =>
  api.get(`/coupons/validate/${code}/`)

