import request from '../api/request'

export const getPortalStats = () => request.get('/portal/stats').then((res) => res.data)
export const getPortalCats = (params) => request.get('/portal/cats', { params }).then((res) => res.data)
export const getPortalCatDetail = (id) => request.get(`/portal/cats/${id}`).then((res) => res.data)
export const getPortalPosts = (params) => request.get('/portal/posts', { params }).then((res) => res.data)
export const getPortalPostDetail = (id) => request.get(`/portal/posts/${id}`).then((res) => res.data)
export const createPortalPost = (data) => request.post('/portal/posts', { data }).then((res) => res.data)
export const likePortalPost = (id) => request.post(`/portal/posts/${id}/like`).then((res) => res.data)
export const getPortalComments = (id) => request.get(`/portal/posts/${id}/comments`).then((res) => res.data)
export const createPortalComment = (id, data) => request.post(`/portal/posts/${id}/comments`, { data }).then((res) => res.data)
export const getPortalSupplies = (params) => request.get('/portal/supplies', { params }).then((res) => res.data)
export const createPortalAdoption = (data) => request.post('/portal/adoptions', { data }).then((res) => res.data)
export const createPortalDonation = (data) => request.post('/portal/donations', { data }).then((res) => res.data)
export const uploadImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then((res) => res.data)
}
