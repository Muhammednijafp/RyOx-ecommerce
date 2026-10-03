import api from './axios'

export const getOrders    = ()     => api.get('/orders/')
export const getOrder     = (id)   => api.get(`/orders/${id}/`)
export const placeOrder   = (data) => api.post('/orders/place/', data)
export const cancelOrder  = (id)   => api.post(`/orders/${id}/cancel/`)
export const applyCoupon  = (code, cart_total) => api.post('/coupons/apply/', { code, cart_total })