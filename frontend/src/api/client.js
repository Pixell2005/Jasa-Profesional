// src/api/client.js

const BASE_URL = 'http://localhost:8080/api/v1'

const getToken = () => localStorage.getItem('token')

const authHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
})

const handleResponse = async (res) => {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Terjadi kesalahan')
  return data
}

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════
export const authAPI = {
  register: (name, email, password) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    }).then(handleResponse),

  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  me: () => fetch(`${BASE_URL}/auth/me`, { headers: authHeader() }).then(handleResponse),

  forgotPassword: (email, name, newPassword) =>
    fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, new_password: newPassword }),
    }).then(handleResponse),

  changePassword: (oldPassword, newPassword) =>
    fetch(`${BASE_URL}/auth/change-password`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    }).then(handleResponse),

  updateProfile: (name, email) =>
    fetch(`${BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ name, email }),
    }).then(handleResponse),
}

// ══════════════════════════════════════════════════════════
// VENDOR
// ══════════════════════════════════════════════════════════
export const vendorAPI = {
  getAll: (category = '') => {
    const url = category ? `${BASE_URL}/vendors?category=${category}` : `${BASE_URL}/vendors`
    return fetch(url).then(handleResponse)
  },

  getByID: (id) => fetch(`${BASE_URL}/vendors/${id}`).then(handleResponse),

  register: (data) =>
    fetch(`${BASE_URL}/vendors/register`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getProfile: () =>
    fetch(`${BASE_URL}/vendors/profile`, { headers: authHeader() }).then(handleResponse),

  updateProfile: (data) =>
    fetch(`${BASE_URL}/vendors/profile`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  setAvailability: (isAvailable) =>
    fetch(`${BASE_URL}/vendors/availability`, {
      method: 'PUT',
      headers: authHeader(),
      body: JSON.stringify({ is_available: isAvailable }),
    }).then(handleResponse),

  getBookings: () =>
    fetch(`${BASE_URL}/vendors/bookings`, { headers: authHeader() }).then(handleResponse),

  acceptBooking: (bookingId) =>
    fetch(`${BASE_URL}/vendors/bookings/${bookingId}/accept`, {
      method: 'PUT', headers: authHeader(),
    }).then(handleResponse),

  rejectBooking: (bookingId) =>
    fetch(`${BASE_URL}/vendors/bookings/${bookingId}/reject`, {
      method: 'PUT', headers: authHeader(),
    }).then(handleResponse),

  completeBooking: (bookingId) =>
    fetch(`${BASE_URL}/vendors/bookings/${bookingId}/complete`, {
      method: 'PUT', headers: authHeader(),
    }).then(handleResponse),
}

// ══════════════════════════════════════════════════════════
// BOOKING
// ══════════════════════════════════════════════════════════
export const bookingAPI = {
  create: (data) =>
    fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  getMyBookings: () =>
    fetch(`${BASE_URL}/bookings/my`, { headers: authHeader() }).then(handleResponse),

  getByID: (id) =>
    fetch(`${BASE_URL}/bookings/${id}`, { headers: authHeader() }).then(handleResponse),

  cancel: (id) =>
    fetch(`${BASE_URL}/bookings/${id}/cancel`, {
      method: 'DELETE', headers: authHeader(),
    }).then(handleResponse),
}

// ══════════════════════════════════════════════════════════
// REVIEW
// ══════════════════════════════════════════════════════════
export const reviewAPI = {
  submit: (bookingId, rating, comment) =>
    fetch(`${BASE_URL}/bookings/${bookingId}/review`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify({ rating, comment }),
    }).then(handleResponse),

  getByVendor: (vendorId) =>
    fetch(`${BASE_URL}/vendors/${vendorId}/reviews`, {
      headers: authHeader(),
    }).then(handleResponse),
}

// ══════════════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════════════
export const adminAPI = {
  getDashboard: () =>
    fetch(`${BASE_URL}/admin/dashboard`, { headers: authHeader() }).then(handleResponse),

  getAllUsers: () =>
    fetch(`${BASE_URL}/admin/users`, { headers: authHeader() }).then(handleResponse),

  getAllVendors: () =>
    fetch(`${BASE_URL}/admin/vendors`, { headers: authHeader() }).then(handleResponse),

  suspendUser: (userId) =>
    fetch(`${BASE_URL}/admin/users/${userId}/suspend`, {
      method: 'PUT', headers: authHeader(),
    }).then(handleResponse),

  activateUser: (userId) =>
    fetch(`${BASE_URL}/admin/users/${userId}/activate`, {
      method: 'PUT', headers: authHeader(),
    }).then(handleResponse),
}