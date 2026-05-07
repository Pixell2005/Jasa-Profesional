// src/pages/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Password dan konfirmasi tidak cocok')
    if (form.password.length < 8) return setError('Password minimal 8 karakter')

    setIsLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/login', { state: { message: 'Registrasi berhasil! Silakan masuk.' } })
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
          Bergabung &amp;<br />
          <span>Mulai Sekarang</span>
        </h1>
        <p className="auth-hero-desc">
          Daftar gratis dan temukan vendor profesional terpercaya untuk segala kebutuhan Anda dalam hitungan menit.
        </p>

        <div style={{marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {[
            { title: 'Terverifikasi', desc: 'Semua vendor telah melalui proses verifikasi ketat' },
            { title: 'Terjamin', desc: 'Layanan dijamin dengan perlindungan konsumen' },
            { title: 'Transparan', desc: 'Harga transparan tanpa biaya tersembunyi' },
          ].map(item => (
            <div key={item.title} style={{display:'flex', gap:'12px', alignItems:'flex-start'}}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'rgba(59,130,246,0.2)', border: '1.5px solid #3b82f6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, marginTop: '1px',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div style={{color:'#e2e8f0', fontSize:'14px', fontWeight:'600'}}>{item.title}</div>
                <div style={{color:'#64748b', fontSize:'13px', marginTop:'2px'}}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right form */}
      <div className="auth-form-side">
        <div className="auth-card">
          <h2 className="auth-card-title">Buat akun baru</h2>
          <p className="auth-card-subtitle">
            Sudah punya akun? <Link to="/login">Masuk di sini</Link>
          </p>

          {error && (
            <div className="alert alert-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label">Nama Lengkap</label>
              <input className="form-input" type="text" name="name"
                value={form.name} onChange={handleChange}
                placeholder="Nama lengkap Anda" required />
            </div>

            <div className="form-field">
              <label className="form-label">Alamat Email</label>
              <input className="form-input" type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="nama@email.com" required />
            </div>

            <div className="section-sep">
              <div className="section-sep-line"/>
              <span className="section-sep-text">Buat Password</span>
              <div className="section-sep-line"/>
            </div>

            <div className="form-field">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder="Minimal 8 karakter" required />
            </div>

            <div className="form-field">
              <label className="form-label">Konfirmasi Password</label>
              <input className="form-input" type="password" name="confirmPassword"
                value={form.confirmPassword} onChange={handleChange}
                placeholder="Ulangi password" required />
            </div>

            <button className="btn-primary" type="submit" disabled={isLoading}>
              {isLoading ? 'Membuat akun...' : 'Daftar Gratis'}
            </button>

            <p style={{fontSize:'12px', color:'var(--gray-400)', textAlign:'center', marginTop:'1rem', lineHeight:'1.5'}}>
              Dengan mendaftar, Anda menyetujui Syarat & Ketentuan dan Kebijakan Privasi kami.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}