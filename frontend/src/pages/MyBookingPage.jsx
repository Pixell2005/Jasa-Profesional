// src/pages/MyBookingPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../api/client'
import Navbar from '../components/Navbar'

const STATUS = {
  pending:     { label: 'Menunggu Konfirmasi', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  confirmed:   { label: 'Dikonfirmasi',        color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  accepted:    { label: 'Diterima Vendor',     color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  in_progress: { label: 'Dalam Proses',        color: '#4338ca', bg: '#e0e7ff', border: '#c7d2fe' },
  completed:   { label: 'Selesai',             color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  cancelled:   { label: 'Dibatalkan',          color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  rejected:    { label: 'Ditolak Vendor',      color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
}

export default function MyBookingsPage() {
  const navigate  = useNavigate()
  const [bookings, setBookings]   = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState('')

  useEffect(() => {
    bookingAPI.getMyBookings()
      .then(res => setBookings(res.data || []))
      .catch(() => setError('Gagal memuat riwayat booking'))
      .finally(() => setIsLoading(false))
  }, [])

  const activeBookings    = bookings.filter(b => !['completed','cancelled','rejected'].includes(b.status))
  const completedBookings = bookings.filter(b =>  ['completed','cancelled','rejected'].includes(b.status))

  return (
    <div className="page-shell">
      <Navbar />

      <div className="page-container--narrow">
        {/* Header */}
        <button onClick={() => navigate('/')} className="back-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali ke Beranda
        </button>

        <div style={{ marginBottom: '2.5rem' }}>
          <h1 className="page-title">Booking Saya</h1>
          <p className="page-subtitle">Lacak status pesanan dan kelola riwayat layanan profesional Anda.</p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p className="loading-text">Memuat data booking...</p>
          </div>
        )}

        {/* Error */}
        {error && <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>}

        {/* Empty */}
        {!isLoading && !error && bookings.length === 0 && (
          <div className="empty-state">
            <svg className="empty-state-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
            <p className="empty-state-title">Belum ada pesanan aktif</p>
            <p className="empty-state-desc">Temukan vendor profesional dan buat pesanan layanan pertama Anda.</p>
            <button onClick={() => navigate('/')} className="btn-primary" style={{ maxWidth: '200px', display: 'inline-block' }}>
              Cari Layanan
            </button>
          </div>
        )}

        {/* Active bookings */}
        {activeBookings.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-label">
              <div className="section-label-dot" style={{ background: 'var(--blue)' }} />
              Sedang Berjalan — {activeBookings.length} Pesanan
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {/* Completed bookings */}
        {completedBookings.length > 0 && (
          <div>
            <div className="section-label">
              <div className="section-label-dot" style={{ background: 'var(--gray-300)' }} />
              Riwayat Selesai — {completedBookings.length} Pesanan
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {completedBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BookingCard({ booking }) {
  const st = STATUS[booking.status] || STATUS.pending
  const isNew = ['pending', 'accepted', 'confirmed'].includes(booking.status)

  return (
    <div className="mybooking-card">
      <div className="mybooking-card-top">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
            <span className="mybooking-id-badge">#{booking.id.slice(0, 8).toUpperCase()}</span>
            {isNew && <span className="mybooking-new-badge">Pesanan Baru</span>}
          </div>
          <div className="mybooking-date">
            {new Date(booking.service_date).toLocaleDateString('id-ID', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </div>
          <div className="mybooking-time">Pukul {booking.service_time}</div>
        </div>

        <span className="status-badge" style={{
          padding: '6px 12px', borderRadius: '8px', flexShrink: 0,
          color: st.color, background: st.bg, border: `1px solid ${st.border}`
        }}>
          {st.label}
        </span>
      </div>

      <div className="mybooking-address">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {booking.address}
      </div>

      <div className="mybooking-price-box">
        <div>
          <div className="mybooking-price-label">Total Pembayaran</div>
          <div className="mybooking-price-value">Rp {booking.total_price?.toLocaleString('id-ID')}</div>
        </div>
        {booking.admin_fee > 0 && (
          <div style={{ fontSize: '12px', color: 'var(--gray-400)', textAlign: 'right', lineHeight: '1.5' }}>
            Termasuk biaya platform<br />
            <strong style={{ color: 'var(--gray-600)' }}>Rp {booking.admin_fee?.toLocaleString('id-ID')}</strong>
          </div>
        )}
      </div>
    </div>
  )
}