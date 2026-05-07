// src/pages/VendorRegisterPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { vendorAPI } from '../api/client'

const CATEGORIES = [
  'Cleaning', 'Plumbing', 'Electrical', 'Carpentry',
  'Painting', 'Pest Control', 'Landscaping', 'HVAC', 'Other'
]

const BENEFITS = [
  { title: 'Jangkauan Luas', desc: 'Dapatkan pelanggan baru setiap harinya dari platform kami.' },
  { title: 'Sistem Terintegrasi', desc: 'Kelola jadwal, pesanan, dan pendapatan dalam satu dashboard praktis.' },
  { title: 'Pembayaran Aman', desc: 'Sistem pembayaran terjamin dan transparan untuk setiap pesanan selesai.' },
]

export default function VendorRegisterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({ name: '', category: '', bio: '', phone: '', price: '', etaHours: '', tags: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    return (
      <div className="auth-center-page">
        <div className="auth-center-card" style={{ textAlign: 'center' }}>
          <div className="icon-wrap" style={{ margin: '0 auto 1.5rem', background: '#fef2f2' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
          </div>
          <h2 className="auth-card-title" style={{ fontSize: '22px' }}>Akses Ditolak</h2>
          <p className="auth-card-subtitle" style={{ marginBottom: '2rem' }}>
            Silakan masuk terlebih dahulu untuk mendaftar sebagai vendor profesional.
          </p>
          <button className="btn-primary" onClick={() => navigate('/login')}>Menuju Halaman Login</button>
        </div>
      </div>
    )
  }

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.name || !form.category || !form.phone || !form.price || !form.etaHours) {
      setError('Semua field wajib diisi'); return
    }
    if (parseInt(form.price) < 10000) { setError('Harga minimum Rp 10.000'); return }
    if (parseInt(form.etaHours) < 1)  { setError('Waktu estimasi minimal 1 jam'); return }

    setIsLoading(true)
    try {
      const payload = {
        name: form.name, category: form.category, bio: form.bio, phone: form.phone,
        price: parseInt(form.price), eta_hours: parseInt(form.etaHours),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      }
      const res = await vendorAPI.register(payload)
      if (res.success) navigate('/vendor/dashboard', { state: { message: 'Registrasi vendor berhasil! Selamat datang di dashboard vendor.' } })
    } catch (err) { setError(err.message || 'Gagal mendaftar vendor') }
    finally { setIsLoading(false) }
  }

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-panel">
        <div className="auth-brand" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div className="auth-brand-mark">JP</div>
          <span className="auth-brand-name">Jasa Profesional</span>
        </div>

        <h1 className="auth-hero-title">
          Kembangkan Bisnis<br />
          <span>Jasa Anda</span>
        </h1>
        <p className="auth-hero-desc">
          Bergabunglah dengan ribuan vendor profesional lainnya. Jangkau lebih banyak pelanggan dan kelola pesanan Anda dengan mudah.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {BENEFITS.map(item => (
            <div key={item.title} className="benefit-item">
              <div className="benefit-icon">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <div>
                <div className="benefit-title">{item.title}</div>
                <div className="benefit-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="auth-form-side">
        <div className="auth-card" style={{ maxWidth: '520px', padding: '2.5rem', position: 'relative' }}>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px', 
              background: 'none', 
              border: 'none', 
              color: 'var(--gray-500)', 
              cursor: 'pointer', 
              marginBottom: '1.5rem', 
              padding: 0, 
              fontSize: '14px', 
              fontWeight: '500',
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'var(--gray-900)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--gray-500)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Kembali
          </button>
          
          <h2 className="auth-card-title" style={{ fontSize: '24px' }}>Daftar Vendor</h2>
          <p className="auth-card-subtitle">Lengkapi profil layanan untuk mulai menerima pesanan.</p>

          {error && (
            <div className="alert alert-error">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-field">
              <label className="form-label">Nama Bisnis / Layanan</label>
              <input className="form-input" type="text" name="name"
                value={form.name} onChange={handleChange}
                placeholder="Contoh: Jasa Bersih Maksimal" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-field">
                <label className="form-label">Kategori</label>
                <div className="input-wrap">
                  <select className="form-input" name="category"
                    value={form.category} onChange={handleChange} required
                    style={{ appearance: 'none', paddingRight: '36px', cursor: 'pointer' }}>
                    <option value="" disabled>Pilih Kategori</option>
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <svg style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--gray-400)' }}
                    width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">No. Telepon (WhatsApp)</label>
                <input className="form-input" type="tel" name="phone"
                  value={form.phone} onChange={handleChange}
                  placeholder="08xxxxxxxxxx" required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-field">
                <label className="form-label">Harga Mulai Dari (Rp)</label>
                <div className="input-wrap">
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)', fontSize: '14px', fontWeight: '500' }}>Rp</span>
                  <input className="form-input" type="number" name="price"
                    value={form.price} onChange={handleChange}
                    placeholder="100000" min="10000" style={{ paddingLeft: '38px' }} required />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Waktu Pengerjaan (Jam)</label>
                <div className="input-wrap">
                  <input className="form-input" type="number" name="etaHours"
                    value={form.etaHours} onChange={handleChange}
                    placeholder="2" min="1" required />
                  <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-500)', fontSize: '13px' }}>Jam</span>
                </div>
              </div>
            </div>

            <div className="form-field">
              <label className="form-label">Tags (Keunggulan / Kata Kunci)</label>
              <input className="form-input" type="text" name="tags"
                value={form.tags} onChange={handleChange}
                placeholder="Pisahkan dengan koma (contoh: profesional, cepat, murah)" />
            </div>

            <div className="form-field">
              <label className="form-label">Deskripsi Layanan (Opsional)</label>
              <textarea className="form-input" name="bio"
                value={form.bio} onChange={handleChange}
                placeholder="Deskripsikan kelebihan layanan Anda..."
                style={{ minHeight: '80px', resize: 'vertical' }} />
            </div>

            <button className="btn-primary" type="submit" disabled={isLoading} style={{ marginTop: '1rem' }}>
              {isLoading ? 'Memproses Pendaftaran...' : 'Daftar Sebagai Vendor'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
