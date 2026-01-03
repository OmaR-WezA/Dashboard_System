import axios from 'axios'

const api = axios.create({
  baseURL: 'https://shawnee-uncommutable-royal.ngrok-free.dev/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
const token = localStorage.getItem('token')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

export default api

