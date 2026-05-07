// src/pages/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    try {
      const user = await login(form.email, form.password)
      if (user?.role === 'admin') navigate('/admin')
      else if (user?.role === 'vendor') navigate('/vendor/dashboard')
      else navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-panel">
        <div className="auth-brand">
          <div className="auth-brand-mark">JP</div>
          <span className="auth-brand-name">Jasa Profesional</span>
        </div>
        <h1 className="auth-hero-title">
          Solusi Jasa<br />
          <span>Profesional #1</span>
        </h1>
        <p className="auth-hero-desc">
          Temukan ribuan vendor terverifikasi untuk kebutuhan rumah, kantor, dan bisnis Anda — cepat, aman, dan terpercaya.
        </p>
        <div className="auth-stats">
          <div>
            <div className="auth-stat-num">500+</div>
            <div className="auth-stat-label">Vendor Aktif</div>
          </div>
          <div>
            <div className="auth-stat-num">10K+</div>
            <div className="auth-stat-label">Booking Selesai</div>
          </div>
          <div>
            <div className="auth-stat-num">4.9★</div>
            <div className="auth-stat-label">Rating Rata-rata</div>
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-side">
        <div className="auth-card">
          <h2 className="auth-card-title">Selamat datang kembali</h2>
          <p className="auth-card-subtitle">
            Belum punya akun? <Link to="/register">Daftar gratis sekarang</Link>
          </p>

          {error && (
            <div className="alert alert-error">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label">Alamat Email</label>
              <input
                className="form-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="nama@email.com"
                required
              />
            </div>

            <div className="form-field">
              <div className="label-row">
                <label className="form-label" style={{margin:0}}>Password</label>
                <Link to="/forgot-password" className="forgot-link">Lupa password?</Link>
              </div>
              <div className="input-wrap" style={{marginTop:'7px'}}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  required
                />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}>
                  {showPass
                    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Memproses...' : 'Masuk ke Akun'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}