import request from './request'

export const login = (data) => request.post('/auth/login', data).then((res) => res.data)
export const register = (data) => request.post('/auth/register', data).then((res) => res.data)
export const listItems = (resource, params) => request.get(`/${resource}`, { params }).then((res) => res.data)
export const createItem = (resource, data) => request.post(`/${resource}`, { data }).then((res) => res.data)
export const updateItem = (resource, id, data) => request.put(`/${resource}/${id}`, { data }).then((res) => res.data)
export const deleteItem = (resource, id) => request.delete(`/${resource}/${id}`).then((res) => res.data)
export const getDashboardStats = () => request.get('/dashboard/stats').then((res) => res.data)
