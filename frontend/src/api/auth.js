import api from './axios'

export const registerUser = (data) => api.post('/users/register/', data)
export const loginUser    = (data) => api.post('/users/login/', data)
export const logoutUser   = (data) => api.post('/users/logout/', data)
export const getProfile   = ()     => api.get('/users/profile/')
export const updateProfile = (data) => api.patch('/users/profile/', data)
export const getAddresses  = ()    => api.get('/users/addresses/')
export const addAddress    = (data) => api.post('/users/addresses/', data)
export const deleteAddress = (id)  => api.delete(`/users/addresses/${id}/`)