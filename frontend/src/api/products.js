import api from './axios'

export const getProducts    = (params) => api.get('/products/', { params })
export const getProduct     = (slug)   => api.get(`/products/${slug}/`)
export const getCategories  = ()       => api.get('/products/categories/')
export const getScentNotes  = ()       => api.get('/products/scent-notes/')