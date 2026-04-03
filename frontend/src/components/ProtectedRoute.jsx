// src/components/ProtectedRoute.jsx
// Komponen ini membungkus halaman yang hanya bisa diakses setelah login
// Kalau belum login → redirect ke /login otomatis

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, isLoading } = useAuth()

  // Tunggu dulu sampai pengecekan token selesai
  // Tanpa ini, user yang sudah login akan di-redirect ke /login sebentar
  // sebelum token selesai diverifikasi
  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <p>Memuat...</p>
      </div>
    )
  }

  // Belum login → paksa ke halaman login
  // "replace" supaya tombol Back tidak kembali ke halaman yang diproteksi
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // Sudah login → tampilkan halaman yang diminta
  return children
}