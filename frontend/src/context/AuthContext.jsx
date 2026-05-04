// src/context/AuthContext.jsx
// Context = cara berbagi data (user yang login) ke semua komponen
// tanpa harus passing props satu per satu

import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../api/client'

// Buat context kosong dulu
const AuthContext = createContext(null)

// AuthProvider membungkus seluruh app dan menyediakan data auth
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // data user yang login
  const [isLoading, setIsLoading] = useState(true) // true saat pertama cek token

  // ── Saat app pertama dibuka: cek token di localStorage ──
  // Kalau ada token, verifikasi ke server apakah masih valid
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsLoading(false)
      return
    }

    // Token ada → tanya server: "siapa saya?"
    authAPI.me()
      .then((res) => {
        setUser(res.data) // token masih valid, set user
      })
      .catch(() => {
        // Token expired atau tidak valid → bersihkan
        localStorage.removeItem('token')
        setUser(null)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [])

  // ── Login ─────────────────────────────────────────────────
  const login = async (email, password) => {
    const res = await authAPI.login(email, password)
    // Simpan token ke localStorage agar tetap ada setelah refresh
    localStorage.setItem('token', res.data.token)
    setUser(res.data.user)
    // Return user object agar caller bisa redirect berdasarkan role
    return res.data.user
  }

  // ── Register ──────────────────────────────────────────────
  const register = async (name, email, password) => {
    const res = await authAPI.register(name, email, password)
    return res
    // Setelah register, user harus login manual
    // (bisa juga auto-login kalau mau, tapi ini lebih eksplisit)
  }

  // ── Logout ────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token') // hapus token
    setUser(null)                    // reset state
  }

  // Nilai yang bisa diakses semua komponen di dalam AuthProvider
  const value = {
    user,
    isLoading,
    isLoggedIn: !!user, // true kalau user tidak null
    login,
    register,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth — hook untuk pakai context ini di komponen manapun
// Contoh: const { user, login, logout } = useAuth()
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider')
  }
  return context
}