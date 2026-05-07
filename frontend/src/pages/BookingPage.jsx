// src/pages/BookingPage.jsx
// Halaman ini PROTECTED — hanya bisa diakses setelah login
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { vendorAPI, bookingAPI } from '../api/client'

export default function BookingPage() {
  const { vendorId } = useParams() // ambil :vendorId dari URL
  const navigate = useNavigate()

  const [vendor, setVendor] = useState(null)
  const [isLoadingVendor, setIsLoadingVendor] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    service_date: '',
    service_time: '09:00',
    address: '',
    notes: '',
  })

  // Ambil detail vendor berdasarkan ID di URL
  useEffect(() => {
    vendorAPI.getByID(vendorId)
      .then((res) => setVendor(res.data))
      .catch(() => setError('Vendor tidak ditemukan'))
      .finally(() => setIsLoadingVendor(false))
  }, [vendorId])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await bookingAPI.create({
        vendor_id: vendorId,
        service_date: form.service_date,
        service_time: form.service_time,
        address: form.address,
        notes: form.notes,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingVendor) {
    return (
      <div className="auth-center-page">
        <div style={{ color: 'var(--navy)', fontWeight: '600', fontSize: '16px' }}>Memuat informasi vendor...</div>
      </div>
    )
  }

  if (!vendor) {
    return (
      <div className="auth-center-page">
        <div className="auth-center-card" style={{ textAlign: 'center' }}>
          <div className="icon-wrap" style={{ margin: '0 auto 1.5rem', background: '#fef2f2' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h2 className="auth-card-title">Vendor Tidak Ditemukan</h2>
          <p className="auth-card-subtitle" style={{ marginBottom: '2rem' }}>Vendor yang Anda cari tidak ada atau tidak tersedia.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Kembali ke Beranda</button>
        </div>
      </div>
    )
  }

  // Tampilan setelah booking berhasil
  if (success) {
    return (
      <div className="auth-center-page">
        <div className="auth-center-card" style={{ textAlign: 'center', padding: '3.5rem 2.5rem' }}>
          <div className="success-mark">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <h2 className="auth-card-title" style={{ fontSize: '24px', marginBottom: '10px' }}>Booking Berhasil!</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '15px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            Pesanan Anda telah diteruskan ke <strong>{vendor.name}</strong>. Vendor akan meninjau dan segera memproses pesanan Anda.
          </p>
          <button className="btn-primary" onClick={() => navigate('/bookings')}>
            Lihat Status Booking
          </button>
        </div>
      </div>
    )
  }

  const adminFee = 10000
  const totalPrice = vendor.price + adminFee

  return (
    <div className="auth-center-page">
      <div className="auth-center-card" style={{ maxWidth: '560px', width: '100%' }}>
        {/* Header / Back Link */}
        <button 
          onClick={() => navigate('/')} 
          className="back-link" 
          style={{ background: 'none', border: 'none', padding: 0, marginBottom: '1.5rem' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali ke Beranda
        </button>

        <h1 className="auth-card-title" style={{ fontSize: '24px', marginBottom: '1.5rem' }}>Konfirmasi Booking</h1>

        {/* Info vendor */}
        <div style={{
          display: 'flex', gap: '16px', alignItems: 'center',
          background: 'var(--gray-50)', borderRadius: '14px', padding: '16px',
          border: '1px solid var(--gray-200)', marginBottom: '2rem'
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '18px', fontWeight: '800', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
          }}>
            {vendor.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy)' }}>{vendor.name}</div>
            <div style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '2px', fontWeight: '500' }}>{vendor.category || vendor.role}</div>
          </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-field">
              <label className="form-label">Tanggal Layanan</label>
              <input className="form-input" type="date" name="service_date"
                value={form.service_date} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} // tidak bisa pilih masa lalu
                required />
            </div>
            <div className="form-field">
              <label className="form-label">Jam Mulai</label>
              <input className="form-input" type="time" name="service_time"
                value={form.service_time} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Alamat Lengkap</label>
            <input className="form-input" type="text" name="address"
              value={form.address} onChange={handleChange}
              placeholder="Contoh: Jl. Sudirman No. 123, Jakarta" required />
          </div>

          <div className="form-field" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Catatan (opsional)</label>
            <textarea className="form-input" name="notes" 
              value={form.notes} onChange={handleChange}
              placeholder="Detail pekerjaan atau kondisi khusus..." 
              style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>

          {/* Ringkasan harga */}
          <div style={{
            background: 'var(--gray-50)', borderRadius: '12px', padding: '16px 20px',
            marginBottom: '1.5rem', border: '1px solid var(--gray-200)',
          }}>
            <h3 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px' }}>Ringkasan Pembayaran</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--gray-600)', marginBottom: '8px' }}>
              <span>Biaya Layanan</span>
              <span style={{ fontWeight: '600', color: 'var(--navy)' }}>Rp {vendor.price.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--gray-600)', marginBottom: '12px' }}>
              <span>Biaya Admin</span>
              <span style={{ fontWeight: '600', color: 'var(--navy)' }}>Rp {adminFee.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ 
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: '12px', borderTop: '1px dashed var(--gray-300)',
            }}>
              <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy)' }}>Total Tagihan</span>
              <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--blue)', letterSpacing: '-0.02em' }}>Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses Booking...' : 'Selesaikan Booking Sekarang'}
          </button>
        </form>
      </div>
    </div>
  )
}