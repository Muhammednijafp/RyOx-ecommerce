import api from './axios'

export const getWishlist       = ()     => api.get('/wishlist/')
export const addToWishlist     = (data) => api.post('/wishlist/', data)
export const removeFromWishlist = (id)  => api.delete(`/wishlist/${id}/`)