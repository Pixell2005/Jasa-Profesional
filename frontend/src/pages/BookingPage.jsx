// src/pages/BookingPage.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { vendorAPI, bookingAPI } from '../api/client'

export default function BookingPage() {
  const { vendorId } = useParams()
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

  useEffect(() => {
    vendorAPI.getByID(vendorId)
      .then(res => setVendor(res.data))
      .catch(() => setError('Vendor tidak ditemukan'))
      .finally(() => setIsLoadingVendor(false))
  }, [vendorId])

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true); setError('')
    try {
      await bookingAPI.create({ vendor_id: vendorId, ...form })
      setSuccess(true)
    } catch (err) { setError(err.message) }
    finally { setIsSubmitting(false) }
  }

  /* Loading */
  if (isLoadingVendor) {
    return (
      <div className="booking-page">
        <div className="booking-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <div className="spinner" style={{ margin: '0 auto 1rem' }} />
          <p className="loading-text">Memuat informasi vendor...</p>
        </div>
      </div>
    )
  }

  /* Vendor not found */
  if (!vendor) {
    return (
      <div className="booking-page">
        <div className="booking-card" style={{ textAlign: 'center' }}>
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

  /* Success */
  if (success) {
    return (
      <div className="booking-page">
        <div className="booking-card" style={{ textAlign: 'center', padding: '3.5rem 2.5rem' }}>
          <div className="success-mark">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
          <h2 className="auth-card-title" style={{ fontSize: '24px', marginBottom: '10px' }}>Booking Berhasil!</h2>
          <p style={{ color: 'var(--gray-500)', fontSize: '15px', lineHeight: '1.6', marginBottom: '2.5rem' }}>
            Pesanan Anda telah diteruskan ke <strong>{vendor.name}</strong>. Vendor akan meninjau dan segera memproses pesanan Anda.
          </p>
          <button className="btn-primary" onClick={() => navigate('/bookings')}>Lihat Status Booking</button>
        </div>
      </div>
    )
  }

  const adminFee  = 10000
  const totalPrice = vendor.price + adminFee

  return (
    <div className="booking-page">
      <div className="booking-card">
        {/* Back */}
        <button onClick={() => navigate('/')} className="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali ke Beranda
        </button>

        <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--navy)', letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
          Konfirmasi Booking
        </h1>

        {/* Vendor info */}
        <div className="booking-vendor-box">
          <div className="booking-vendor-avatar">
            {vendor.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="booking-vendor-name">{vendor.name}</div>
            <div className="booking-vendor-cat">{vendor.category || vendor.role}</div>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
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
                min={new Date().toISOString().split('T')[0]} required />
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

          <div className="form-field" style={{ marginBottom: '1.5rem' }}>
            <label className="form-label">Catatan (opsional)</label>
            <textarea className="form-input" name="notes"
              value={form.notes} onChange={handleChange}
              placeholder="Detail pekerjaan atau kondisi khusus..."
              style={{ minHeight: '80px', resize: 'vertical' }} />
          </div>

          {/* Price summary */}
          <div className="booking-price-box">
            <h3 style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
              Ringkasan Pembayaran
            </h3>
            <div className="booking-price-row">
              <span>Biaya Layanan</span>
              <span className="booking-price-row-value">Rp {vendor.price.toLocaleString('id-ID')}</span>
            </div>
            <div className="booking-price-row">
              <span>Biaya Admin</span>
              <span className="booking-price-row-value">Rp {adminFee.toLocaleString('id-ID')}</span>
            </div>
            <div className="booking-price-divider" />
            <div className="booking-total-row">
              <span className="booking-total-label">Total Tagihan</span>
              <span className="booking-total-value">Rp {totalPrice.toLocaleString('id-ID')}</span>
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