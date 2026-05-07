// src/pages/MyBookingPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI, reviewAPI } from '../api/client'
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
  const [reviewModal, setReviewModal] = useState(null) // { bookingId, vendorName }
  const [cancellingId, setCancellingId] = useState(null)

  useEffect(() => {
    loadBookings()
  }, [])

  const loadBookings = () => {
    bookingAPI.getMyBookings()
      .then(res => setBookings(res.data || []))
      .catch(() => setError('Gagal memuat riwayat booking'))
      .finally(() => setIsLoading(false))
  }

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Yakin ingin membatalkan booking ini?')) return
    setCancellingId(bookingId)
    try {
      await bookingAPI.cancel(bookingId)
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    } catch (err) {
      alert('Gagal membatalkan booking: ' + err.message)
    } finally {
      setCancellingId(null)
    }
  }

  const activeBookings    = bookings.filter(b => !['completed','cancelled','rejected'].includes(b.status))
  const completedBookings = bookings.filter(b =>  ['completed','cancelled','rejected'].includes(b.status))

  return (
    <div className="page-shell">
      <Navbar />

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          bookingId={reviewModal.bookingId}
          vendorName={reviewModal.vendorName}
          onClose={() => setReviewModal(null)}
          onSuccess={(bookingId) => {
            setReviewModal(null)
            setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, _reviewed: true } : b))
          }}
        />
      )}

      <div className="page-container--narrow">
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

        {isLoading && (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }} />
            <p className="loading-text">Memuat data booking...</p>
          </div>
        )}

        {error && <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>}

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

        {activeBookings.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <div className="section-label">
              <div className="section-label-dot" style={{ background: 'var(--blue)' }} />
              Sedang Berjalan — {activeBookings.length} Pesanan
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {activeBookings.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onCancel={handleCancel}
                  onReview={(id, name) => setReviewModal({ bookingId: id, vendorName: name })}
                  isCancelling={cancellingId === b.id}
                />
              ))}
            </div>
          </div>
        )}

        {completedBookings.length > 0 && (
          <div>
            <div className="section-label">
              <div className="section-label-dot" style={{ background: 'var(--gray-300)' }} />
              Riwayat Selesai — {completedBookings.length} Pesanan
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {completedBookings.map(b => (
                <BookingCard
                  key={b.id}
                  booking={b}
                  onCancel={handleCancel}
                  onReview={(id, name) => setReviewModal({ bookingId: id, vendorName: name })}
                  isCancelling={cancellingId === b.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Booking Card ─────────────────────────────────────── */
function BookingCard({ booking, onCancel, onReview, isCancelling }) {
  const st = STATUS[booking.status] || STATUS.pending
  const canCancel  = ['pending', 'accepted'].includes(booking.status)
  const canReview  = booking.status === 'completed' && !booking._reviewed
  const isNew      = ['pending', 'accepted', 'confirmed'].includes(booking.status)

  return (
    <div className="mybooking-card">
      <div className="mybooking-card-top">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
            <span className="mybooking-id-badge">#{booking.id.slice(0, 8).toUpperCase()}</span>
            {isNew && <span className="mybooking-new-badge">Pesanan Baru</span>}
            {booking._reviewed && (
              <span style={{ fontSize: '11px', color: '#15803d', fontWeight: '700', background: '#f0fdf4', padding: '2px 8px', borderRadius: '5px', border: '1px solid #bbf7d0' }}>
                ★ Sudah Diulas
              </span>
            )}
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

      {/* Action buttons */}
      {(canCancel || canReview) && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid var(--gray-100)' }}>
          {canReview && (
            <button
              onClick={() => onReview(booking.id, booking.vendor_name || 'Vendor')}
              style={{
                flex: 1, padding: '10px', fontSize: '13px', fontWeight: '700',
                background: 'var(--navy)', color: '#fff', border: 'none',
                borderRadius: '10px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'background 0.15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Beri Ulasan
            </button>
          )}
          {canCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              disabled={isCancelling}
              style={{
                flex: canReview ? 0 : 1, padding: '10px 16px', fontSize: '13px', fontWeight: '700',
                background: '#fef2f2', color: '#b91c1c', border: '1.5px solid #fecaca',
                borderRadius: '10px', cursor: isCancelling ? 'not-allowed' : 'pointer',
                opacity: isCancelling ? 0.6 : 1, whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
            >
              {isCancelling ? 'Membatalkan...' : 'Batalkan'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Review Modal ─────────────────────────────────────── */
function ReviewModal({ bookingId, vendorName, onClose, onSuccess }) {
  const [rating, setRating]   = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (rating === 0) { setError('Pilih rating bintang terlebih dahulu'); return }
    setIsLoading(true); setError('')
    try {
      await reviewAPI.submit(bookingId, rating, comment)
      onSuccess(bookingId)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)',
      backdropFilter: 'blur(4px)', zIndex: 500,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '2.25rem',
        width: '100%', maxWidth: '460px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        animation: 'slideUp 0.3s cubic-bezier(.22,.68,0,1.2)',
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'var(--navy)', letterSpacing: '-0.02em' }}>
              Beri Ulasan
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginTop: '3px' }}>
              untuk <strong>{vendorName}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: '4px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Stars */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--gray-500)', marginBottom: '12px' }}>
            Seberapa puas Anda dengan layanan ini?
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                  fontSize: '36px', lineHeight: 1, transition: 'transform 0.15s',
                  transform: (hovered || rating) >= s ? 'scale(1.2)' : 'scale(1)',
                  color: (hovered || rating) >= s ? '#f59e0b' : '#e2e8f0',
                }}
              >
                ★
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '700', marginTop: '8px' }}>
              {['', 'Sangat Buruk', 'Kurang Baik', 'Cukup', 'Baik', 'Sangat Baik'][rating]}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

          <div className="form-field">
            <label className="form-label">Komentar (opsional)</label>
            <textarea
              className="form-input"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Ceritakan pengalaman Anda menggunakan layanan ini..."
              style={{ minHeight: '90px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
            <button type="button" onClick={onClose}
              style={{
                flex: 1, padding: '12px', fontSize: '14px', fontWeight: '600',
                background: 'var(--gray-100)', color: 'var(--gray-600)', border: 'none',
                borderRadius: '10px', cursor: 'pointer',
              }}>
              Batal
            </button>
            <button type="submit" disabled={isLoading}
              style={{
                flex: 2, padding: '12px', fontSize: '14px', fontWeight: '700',
                background: 'var(--navy)', color: '#fff', border: 'none',
                borderRadius: '10px', cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
              }}>
              {isLoading ? 'Mengirim...' : 'Kirim Ulasan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}