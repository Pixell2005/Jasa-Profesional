// src/api/client.js
// Semua komunikasi dengan backend dikumpulkan di satu tempat
// Supaya kalau URL backend berubah, cukup ubah di sini saja

const BASE_URL = 'http://localhost:8080/api/v1'

// ── Helper: ambil token dari localStorage ──────────────────
const getToken = () => localStorage.getItem('token')

// ── Helper: buat header standar dengan token JWT ───────────
const authHeader = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
})

// ── Helper: proses response dari server ────────────────────
// Kalau server return error (4xx, 5xx), kita throw supaya bisa di-catch
const handleResponse = async (res) => {
  const data = await res.json()
  if (!res.ok) {
    // Ambil pesan error dari server, kalau tidak ada pakai default
    throw new Error(data.message || 'Terjadi kesalahan')
  }
  return data
}

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════

export const authAPI = {
  // Daftar akun baru
  register: (name, email, password) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    }).then(handleResponse),

  // Login — return { token, user }
  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  // Cek siapa user yang sedang login (pakai token)
  me: () =>
    fetch(`${BASE_URL}/auth/me`, {
      headers: authHeader(),
    }).then(handleResponse),
}

// ══════════════════════════════════════════════════════════
// VENDOR
// ══════════════════════════════════════════════════════════

export const vendorAPI = {
  // Ambil semua vendor, bisa filter by category
  getAll: (category = '') => {
    const url = category
      ? `${BASE_URL}/vendors?category=${category}`
      : `${BASE_URL}/vendors`
    return fetch(url).then(handleResponse)
  },

  // Ambil detail satu vendor
  getByID: (id) =>
    fetch(`${BASE_URL}/vendors/${id}`).then(handleResponse),
}

// ══════════════════════════════════════════════════════════
// BOOKING
// ══════════════════════════════════════════════════════════

export const bookingAPI = {
  // Buat booking baru — butuh login
  create: (data) =>
    fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: authHeader(), // kirim token JWT di header
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Ambil semua booking milik user yang sedang login
  getMyBookings: () =>
    fetch(`${BASE_URL}/bookings/my`, {
      headers: authHeader(),
    }).then(handleResponse),

  // Ambil detail satu booking
  getByID: (id) =>
    fetch(`${BASE_URL}/bookings/${id}`, {
      headers: authHeader(),
    }).then(handleResponse),
}