import api from './axios'

export const createRazorpayOrder   = (order_id) => api.post('/payments/create/', { order_id })
export const verifyPayment         = (data)     => api.post('/payments/verify/', data)
export const verifyRazorpayPayment = (data)     => api.post('/payments/verify/', data)
export const recordFailure         = (data)     => api.post('/payments/failed/', data)