// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import BookingPage from './pages/BookingPage'
import MyBookingPage from './pages/MyBookingPage'
import VendorRegisterPage from './pages/VendorRegisterPage'
import VendorDashboard from './pages/VendorDashboard'
import AdminPanel from './pages/AdminPanel'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Route PUBLIK ── */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* ── Route PROTECTED — harus login ── */}
          <Route
            path="/booking/:vendorId"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookingPage />
              </ProtectedRoute>
            }
          />

          {/* ── Vendor Routes ── */}
          <Route
            path="/vendor/register"
            element={
              <ProtectedRoute>
                <VendorRegisterPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor/dashboard"
            element={
              <ProtectedRoute>
                <VendorDashboard />
              </ProtectedRoute>
            }
          />

          {/* ── Admin Routes ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />

          {/* ── 404 — URL tidak dikenali ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}