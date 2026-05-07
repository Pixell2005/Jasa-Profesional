// src/components/VendorGuard.jsx
// Mencegah user dengan role "vendor" mengakses halaman customer
// Kalau vendor coba buka /, /bookings, /booking/:id → redirect ke /vendor/dashboard

import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function VendorGuard({ children }) {
  const { user, isLoading } = useAuth()

  // Tunggu auth selesai load sebelum redirect
  if (isLoading) return null

  // Kalau user adalah vendor → paksa ke dashboard vendor
  if (user?.role === 'vendor') {
    return <Navigate to="/vendor/dashboard" replace />
  }

  return children
}
