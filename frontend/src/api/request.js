import axios from 'axios'

const request = axios.create({
  baseURL: 'http://127.0.0.1:8001/api',
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
