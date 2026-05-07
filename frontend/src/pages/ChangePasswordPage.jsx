// src/pages/ChangePasswordPage.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../api/client'

const EyeOpen = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
)
const EyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
)

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (form.newPassword !== form.confirmPassword) return setError('Konfirmasi password tidak cocok')
    if (form.newPassword.length < 8) return setError('Password baru minimal 8 karakter')
    if (form.oldPassword === form.newPassword) return setError('Password baru tidak boleh sama dengan password lama')

    setIsLoading(true)
    try {
      await authAPI.changePassword(form.oldPassword, form.newPassword)
      setSuccess('Password berhasil diubah!')
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => {
        if (user?.role === 'vendor') navigate('/vendor/dashboard')
        else navigate('/')
      }, 2000)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const backLink  = user?.role === 'vendor' ? '/vendor/dashboard' : '/'
  const backLabel = user?.role === 'vendor' ? 'Dashboard Vendor' : 'Halaman Utama'

  return (
    <div className="auth-center-page">
      <div className="auth-center-card">
        <Link to={backLink} className="back-link">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          {backLabel}
        </Link>

        <div className="icon-wrap">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>

        <h1 className="auth-card-title">Ganti Password</h1>
        <p className="auth-card-subtitle" style={{marginBottom: '1.75rem'}}>
          Akun: <strong style={{color:'var(--navy)'}}>{user?.email}</strong>
        </p>

        {error && (
          <div className="alert alert-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="alert alert-success">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            {success} Mengalihkan...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Current password */}
          <div className="section-sep">
            <div className="section-sep-line"/>
            <span className="section-sep-text">Password Saat Ini</span>
            <div className="section-sep-line"/>
          </div>

          <div className="form-field">
            <label className="form-label">Password Lama</label>
            <div className="input-wrap">
              <input className="form-input" type={showOld ? 'text' : 'password'} name="oldPassword" value={form.oldPassword} onChange={handleChange} placeholder="Masukkan password saat ini" required />
              <button type="button" className="eye-btn" onClick={() => setShowOld(!showOld)}>
                {showOld ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div className="section-sep">
            <div className="section-sep-line"/>
            <span className="section-sep-text">Password Baru</span>
            <div className="section-sep-line"/>
          </div>

          <div className="form-field">
            <label className="form-label">Password Baru</label>
            <div className="input-wrap">
              <input className="form-input" type={showNew ? 'text' : 'password'} name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Minimal 8 karakter" required />
              <button type="button" className="eye-btn" onClick={() => setShowNew(!showNew)}>
                {showNew ? <EyeOff /> : <EyeOpen />}
              </button>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Konfirmasi Password Baru</label>
            <input className="form-input" type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Ulangi password baru" required />
          </div>

          <div className="hint-box" style={{marginBottom:'1.25rem'}}>
            Password minimal 8 karakter dan tidak boleh sama dengan password lama.
          </div>

          <button className="btn-primary" type="submit" disabled={isLoading || !!success}>
            {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </button>
        </form>
      </div>
    </div>
  )
}
