// src/components/ProtectedRoute.jsx
// Komponen ini membungkus halaman yang hanya bisa diakses setelah login
// Kalau belum login → redirect ke /login otomatis
// Kalau ada requiredRole, cek apakah user memiliki role tersebut

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, requiredRole }) {
  const { isLoggedIn, isLoading, user } = useAuth()

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

  // Cek role jika requiredRole diberikan
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <h2 style={styles.title}>❌ Akses Ditolak</h2>
          <p style={styles.text}>Anda tidak memiliki akses ke halaman ini.</p>
          <p style={styles.text}>Role Anda: <strong>{user?.role}</strong></p>
        </div>
      </div>
    )
  }

  // Sudah login dan memiliki role yang benar → tampilkan halaman yang diminta
  return children
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f0',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    border: '0.5px solid #e0e0e0',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    margin: '0 0 1rem',
  },
  text: {
    fontSize: '14px',
    color: '#666',
    margin: '0.5rem 0',
  },
}