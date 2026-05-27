import axios from 'axios'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('campus_cats_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default request
