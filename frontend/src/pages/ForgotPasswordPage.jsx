// src/pages/ForgotPasswordPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../api/client'

export default function ForgotPasswordPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ email: '', name: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.newPassword !== form.confirmPassword) return setError('Konfirmasi password tidak cocok')
    if (form.newPassword.length < 8) return setError('Password minimal 8 karakter')
    setIsLoading(true)
    try {
      await authAPI.forgotPassword(form.email, form.name, form.newPassword)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 2) {
    return (
      <div className="auth-center-page">
        <div className="auth-center-card" style={{textAlign:'center'}}>
          <div className="success-mark">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h1 className="auth-card-title" style={{textAlign:'center', marginBottom:'10px'}}>Password Direset!</h1>
          <p style={{fontSize:'15px', color:'var(--gray-500)', lineHeight:'1.7', marginBottom:'2rem'}}>
            Password Anda berhasil diperbarui. Silakan masuk dengan password baru.
          </p>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Kembali ke Halaman Masuk
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-center-page">
      <div className="auth-center-card">
        <Link to="/login" className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Kembali ke Masuk
        </Link>

        <div className="icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>

        <h1 className="auth-card-title">Reset Password</h1>
        <p className="auth-card-subtitle" style={{marginBottom:'1.5rem'}}>
          Verifikasi identitas Anda dengan email dan nama terdaftar.
        </p>

        <div className="alert alert-info">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0, marginTop:'1px'}}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>Diperlukan verifikasi <strong>email</strong> dan <strong>nama lengkap</strong> sesuai data pendaftaran untuk keamanan akun Anda.</span>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Verification section */}
          <div className="section-sep">
            <div className="section-sep-line"/>
            <span className="section-sep-text">Verifikasi Identitas</span>
            <div className="section-sep-line"/>
          </div>

          <div className="form-field">
            <label className="form-label">Email Terdaftar</label>
            <input className="form-input" type="email" name="email" value={form.email} onChange={handleChange} placeholder="nama@email.com" required />
          </div>

          <div className="form-field">
            <label className="form-label">Nama Lengkap</label>
            <input className="form-input" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nama sesuai saat mendaftar" required />
          </div>

          {/* New password section */}
          <div className="section-sep">
            <div className="section-sep-line"/>
            <span className="section-sep-text">Password Baru</span>
            <div className="section-sep-line"/>
          </div>

          <div className="form-field">
            <label className="form-label">Password Baru</label>
            <input className="form-input" type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Minimal 8 karakter" required />
          </div>

          <div className="form-field">
            <label className="form-label">Konfirmasi Password</label>
            <input className="form-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Ulangi password baru" required />
          </div>

          <button className="btn-primary" type="submit" disabled={isLoading}>
            {isLoading ? 'Memverifikasi...' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
