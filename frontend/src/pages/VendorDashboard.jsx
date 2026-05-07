// src/pages/VendorDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { vendorAPI } from '../api/client'

const STATUS = {
  pending:   { label: 'Menunggu',  color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  accepted:  { label: 'Diterima',  color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  rejected:  { label: 'Ditolak',   color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
  completed: { label: 'Selesai',   color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
}

export default function VendorDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [bookings, setBookings]         = useState([])
  const [vendor, setVendor]             = useState(null)
  const [isLoading, setIsLoading]       = useState(true)
  const [error, setError]               = useState('')
  const [toast, setToast]               = useState(location.state?.message || '')
  const [actioningId, setActioningId]   = useState(null)

  useEffect(() => { loadData() }, [])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const loadData = async () => {
    try {
      setIsLoading(true); setError('')
      const vRes = await vendorAPI.getProfile()
      if (vRes.success) setVendor(vRes.data)
      else throw new Error('Anda bukan vendor')
      const bRes = await vendorAPI.getBookings()
      if (bRes.success) setBookings(bRes.data || [])
    } catch (err) {
      setError(err.message)
      if (err.message.includes('vendor')) navigate('/vendor/register')
    } finally {
      setIsLoading(false)
    }
  }

  const act = async (fn, bookingId, newStatus, msg) => {
    setActioningId(bookingId)
    try {
      const res = await fn(bookingId)
      if (res.success) {
        setBookings(prev => prev.map(b => b.id === bookingId ? {...b, status: newStatus} : b))
        showToast(msg)
      }
    } catch (err) { setError(err.message) }
    finally { setActioningId(null) }
  }

  const handleAccept   = (id) => act(vendorAPI.acceptBooking, id, 'accepted', 'Booking berhasil diterima')
  const handleReject   = (id) => {
    if (!window.confirm('Yakin ingin menolak booking ini?')) return
    act(vendorAPI.rejectBooking, id, 'rejected', 'Booking ditolak')
  }
  const handleComplete = (id) => act(vendorAPI.completeBooking, id, 'completed', 'Booking selesai')

  if (isLoading) {
    return (
      <div className="vd-page" style={{display:'flex', alignItems:'center', justifyContent:'center'}}>
        <p style={{color:'var(--gray-400)', fontSize:'15px'}}>Memuat data...</p>
      </div>
    )
  }

  const pending   = bookings.filter(b => b.status === 'pending')
  const accepted  = bookings.filter(b => b.status === 'accepted')
  const completed = bookings.filter(b => b.status === 'completed')

  return (
    <div className="vd-page">
      {/* Sticky Header */}
      <header className="vd-header">
        <div className="vd-header-inner">
          <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
            <div className="vd-brand-mark">JP</div>
            <div>
              <div style={{fontSize:'15px', fontWeight:'800', color:'var(--navy)', letterSpacing:'-0.02em'}}>
                Vendor Dashboard
              </div>
              {vendor && (
                <div style={{fontSize:'12px', color:'var(--gray-400)', marginTop:'1px'}}>
                  {vendor.name} &bull; {vendor.category}
                </div>
              )}
            </div>
          </div>

          <div style={{display:'flex', alignItems:'center', gap:'8px'}}>
            <Link to="/" className="vd-header-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Halaman Utama</span>
            </Link>
            <Link to="/change-password" className="vd-header-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Ganti Password</span>
            </Link>
            <button className="vd-logout-btn" onClick={logout}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Keluar
            </button>
          </div>
        </div>
      </header>

      {/* Toast */}
      {toast && (
        <div className="vd-toast success">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {toast}
        </div>
      )}
      {error && (
        <div className="vd-toast error">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Main */}
      <div className="vd-container">
        {/* Stats */}
        {vendor && (
          <div className="vd-stats">
            {[
              { label: 'Rating', value: vendor.rating?.toFixed(1) || '0.0', hint: 'dari 5.0', color: 'var(--navy)' },
              { label: 'Menunggu', value: pending.length, hint: 'perlu respons', color: '#d97706' },
              { label: 'Diterima', value: accepted.length, hint: 'sedang berjalan', color: '#16a34a' },
              { label: 'Selesai', value: completed.length, hint: 'total selesai', color: '#3b82f6' },
            ].map((s) => (
              <div key={s.label} className="vd-stat-card">
                <div className="vd-stat-label">{s.label}</div>
                <div className="vd-stat-value" style={{color: s.color}}>{s.value}</div>
                <div className="vd-stat-hint">{s.hint}</div>
              </div>
            ))}
          </div>
        )}

        {/* Bookings card */}
        <div className="vd-card">
          <h2 className="vd-section-title">Daftar Booking</h2>

          {bookings.length === 0 ? (
            <div className="vd-empty">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
                <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
              </svg>
              <p className="vd-empty-text">Belum ada booking masuk</p>
            </div>
          ) : (
            <>
              {pending.length > 0 && (
                <div className="vd-booking-section" style={{marginBottom:'2rem'}}>
                  <h3 className="vd-sub-title" style={{color:'#d97706'}}>
                    Menunggu Respons &mdash; {pending.length} booking
                  </h3>
                  {pending.map(b => (
                    <BookingCard key={b.id} booking={b}
                      onAccept={handleAccept} onReject={handleReject}
                      isActioning={actioningId === b.id} />
                  ))}
                </div>
              )}

              {accepted.length > 0 && (
                <div className="vd-booking-section" style={{marginBottom:'2rem'}}>
                  <h3 className="vd-sub-title" style={{color:'#16a34a'}}>
                    Diterima &mdash; {accepted.length} booking
                  </h3>
                  {accepted.map(b => (
                    <BookingCard key={b.id} booking={b}
                      onComplete={handleComplete}
                      isActioning={actioningId === b.id} />
                  ))}
                </div>
              )}

              {completed.length > 0 && (
                <div style={{marginBottom:'2rem'}}>
                  <h3 className="vd-sub-title" style={{color:'#3b82f6'}}>
                    Selesai &mdash; {completed.length} booking
                  </h3>
                  {completed.map(b => (
                    <BookingCard key={b.id} booking={b} isActioning={false} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function BookingCard({ booking, onAccept, onReject, onComplete, isActioning }) {
  const st = STATUS[booking.status] || STATUS.pending

  return (
    <div className="vd-booking-card">
      <div className="vd-booking-top">
        <div style={{flex:1}}>
          <div className="vd-booking-date">
            {new Date(booking.service_date).toLocaleDateString('id-ID', {
              weekday:'long', day:'numeric', month:'long', year:'numeric'
            })}
            <span style={{fontWeight:'400', color:'var(--gray-400)'}}>
              &nbsp;&bull;&nbsp;{booking.service_time}
            </span>
          </div>
          <div className="vd-booking-meta">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {booking.address}
          </div>
          {booking.notes && (
            <div className="vd-booking-meta" style={{color:'var(--gray-400)'}}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              </svg>
              {booking.notes}
            </div>
          )}
        </div>

        <div style={{textAlign:'right', flexShrink:0}}>
          <span className="vd-status-badge" style={{
            color: st.color, background: st.bg,
            border: `1.5px solid ${st.border}`
          }}>
            {st.label}
          </span>
          <div className="vd-price">
            Rp {booking.total_price?.toLocaleString('id-ID')}
          </div>
        </div>
      </div>

      {booking.status === 'pending' && (
        <div className="vd-actions">
          <button
            className="vd-action-btn"
            style={{background:'#16a34a'}}
            onClick={() => onAccept(booking.id)}
            disabled={isActioning}
          >
            {isActioning ? 'Memproses...' : 'Terima Booking'}
          </button>
          <button
            className="vd-action-btn"
            style={{background:'#dc2626'}}
            onClick={() => onReject(booking.id)}
            disabled={isActioning}
          >
            {isActioning ? 'Memproses...' : 'Tolak'}
          </button>
        </div>
      )}

      {booking.status === 'accepted' && (
        <div className="vd-actions">
          <button
            className="vd-action-btn"
            style={{background:'#3b82f6', flex:1}}
            onClick={() => onComplete(booking.id)}
            disabled={isActioning}
          >
            {isActioning ? 'Memproses...' : 'Tandai Selesai'}
          </button>
        </div>
      )}
    </div>
  )
}
