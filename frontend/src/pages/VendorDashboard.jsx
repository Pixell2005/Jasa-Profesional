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

const TABS = [
  { id: 'bookings', label: 'Daftar Booking' },
  { id: 'profile',  label: 'Edit Profil' },
]

export default function VendorDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const [bookings, setBookings]       = useState([])
  const [vendor, setVendor]           = useState(null)
  const [isLoading, setIsLoading]     = useState(true)
  const [error, setError]             = useState('')
  const [toast, setToast]             = useState(location.state?.message || '')
  const [actioningId, setActioningId] = useState(null)
  const [activeTab, setActiveTab]     = useState('bookings')
  const [isToggling, setIsToggling]   = useState(false)

  useEffect(() => { loadData() }, [])

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000) }

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
    } finally { setIsLoading(false) }
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
  const handleReject   = (id) => { if (!window.confirm('Yakin ingin menolak?')) return; act(vendorAPI.rejectBooking, id, 'rejected', 'Booking ditolak') }
  const handleComplete = (id) => act(vendorAPI.completeBooking, id, 'completed', 'Booking selesai')

  const handleToggleAvailability = async () => {
    if (!vendor) return
    setIsToggling(true)
    try {
      await vendorAPI.setAvailability(!vendor.is_available)
      setVendor(v => ({ ...v, is_available: !v.is_available }))
      showToast(vendor.is_available ? 'Anda tidak menerima booking baru' : 'Anda sekarang menerima booking')
    } catch (err) { setError(err.message) }
    finally { setIsToggling(false) }
  }

  if (isLoading) {
    return (
      <div className="vd-page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="spinner" />
      </div>
    )
  }

  const pending   = bookings.filter(b => b.status === 'pending')
  const accepted  = bookings.filter(b => b.status === 'accepted')
  const completed = bookings.filter(b => b.status === 'completed')

  return (
    <div className="vd-page">
      {/* Header */}
      <header className="vd-header">
        <div className="vd-header-inner">
          <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
            <div className="vd-brand-mark">JP</div>
            <div>
              <div style={{ fontSize:'15px', fontWeight:'800', color:'var(--navy)', letterSpacing:'-0.02em' }}>Vendor Dashboard</div>
              {vendor && <div style={{ fontSize:'12px', color:'var(--gray-400)', marginTop:'1px' }}>{vendor.name} &bull; {vendor.category}</div>}
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {/* Availability Toggle */}
            {vendor && (
              <button
                onClick={handleToggleAvailability}
                disabled={isToggling}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  fontSize: '12px', fontWeight: '700',
                  background: vendor.is_available ? '#f0fdf4' : '#fef2f2',
                  color: vendor.is_available ? '#15803d' : '#b91c1c',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                  background: vendor.is_available ? '#16a34a' : '#ef4444',
                  boxShadow: vendor.is_available ? '0 0 0 2px rgba(22,163,74,0.25)' : '0 0 0 2px rgba(239,68,68,0.25)',
                }} />
                {vendor.is_available ? 'Menerima Booking' : 'Tidak Menerima'}
              </button>
            )}
            <Link to="/" className="vd-header-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>Beranda</span>
            </Link>
            <Link to="/change-password" className="vd-header-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Password</span>
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          {toast}
        </div>
      )}
      {error && (
        <div className="vd-toast error">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      <div className="vd-container">
        {/* Stats */}
        {vendor && (
          <div className="vd-stats">
            {[
              { label: 'Rating',    value: vendor.rating?.toFixed(1) || '0.0', hint: 'dari 5.0',         color: 'var(--navy)' },
              { label: 'Menunggu', value: pending.length,                       hint: 'perlu respons',    color: '#d97706' },
              { label: 'Diterima', value: accepted.length,                      hint: 'sedang berjalan',  color: '#16a34a' },
              { label: 'Selesai',  value: completed.length,                     hint: 'total selesai',    color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} className="vd-stat-card">
                <div className="vd-stat-label">{s.label}</div>
                <div className="vd-stat-value" style={{ color: s.color }}>{s.value}</div>
                <div className="vd-stat-hint">{s.hint}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab bar */}
        <div className="tab-bar" style={{ marginBottom: '1.5rem' }}>
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Bookings Tab ── */}
        {activeTab === 'bookings' && (
          <div className="vd-card">
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
                  <div className="vd-booking-section" style={{ marginBottom: '2rem' }}>
                    <h3 className="vd-sub-title" style={{ color: '#d97706' }}>Menunggu Respons &mdash; {pending.length} booking</h3>
                    {pending.map(b => (
                      <BookingCard key={b.id} booking={b}
                        onAccept={handleAccept} onReject={handleReject}
                        isActioning={actioningId === b.id} />
                    ))}
                  </div>
                )}
                {accepted.length > 0 && (
                  <div className="vd-booking-section" style={{ marginBottom: '2rem' }}>
                    <h3 className="vd-sub-title" style={{ color: '#16a34a' }}>Diterima &mdash; {accepted.length} booking</h3>
                    {accepted.map(b => (
                      <BookingCard key={b.id} booking={b}
                        onComplete={handleComplete}
                        isActioning={actioningId === b.id} />
                    ))}
                  </div>
                )}
                {completed.length > 0 && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 className="vd-sub-title" style={{ color: '#3b82f6' }}>Selesai &mdash; {completed.length} booking</h3>
                    {completed.map(b => (
                      <BookingCard key={b.id} booking={b} isActioning={false} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Profile Edit Tab ── */}
        {activeTab === 'profile' && vendor && (
          <EditProfileForm
            vendor={vendor}
            onSaved={(updated) => { setVendor(v => ({ ...v, ...updated })); showToast('Profil berhasil diperbarui!') }}
          />
        )}
      </div>
    </div>
  )
}

/* ─── Booking Card ─────────────────────────────────────── */
function BookingCard({ booking, onAccept, onReject, onComplete, isActioning }) {
  const st = STATUS[booking.status] || STATUS.pending
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="vd-booking-card">
      <div className="vd-booking-top">
        <div style={{ flex: 1 }}>
          {/* Customer info row */}
          {booking.customer_name && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--navy), #1e3a5f)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '800', color: '#fff', flexShrink: 0,
              }}>
                {booking.customer_name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--navy)' }}>{booking.customer_name}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>
                  {booking.customer_email}
                  {booking.customer_phone && ` • ${booking.customer_phone}`}
                </div>
              </div>
            </div>
          )}

          <div className="vd-booking-date">
            {new Date(booking.service_date).toLocaleDateString('id-ID', {
              weekday:'long', day:'numeric', month:'long', year:'numeric'
            })}
            <span style={{ fontWeight:'400', color:'var(--gray-400)' }}>&nbsp;&bull;&nbsp;{booking.service_time}</span>
          </div>
          <div className="vd-booking-meta">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {booking.address}
          </div>
          {booking.notes && (
            <div className="vd-booking-meta" style={{ color:'var(--gray-400)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/>
              </svg>
              {booking.notes}
            </div>
          )}
        </div>

        <div style={{ textAlign:'right', flexShrink: 0 }}>
          <span className="vd-status-badge" style={{ color: st.color, background: st.bg, border: `1.5px solid ${st.border}` }}>
            {st.label}
          </span>
          <div className="vd-price">Rp {booking.total_price?.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {booking.status === 'pending' && (
        <div className="vd-actions">
          <button className="vd-action-btn" style={{ background:'#16a34a' }} onClick={() => onAccept(booking.id)} disabled={isActioning}>
            {isActioning ? 'Memproses...' : 'Terima Booking'}
          </button>
          <button className="vd-action-btn" style={{ background:'#dc2626' }} onClick={() => onReject(booking.id)} disabled={isActioning}>
            {isActioning ? 'Memproses...' : 'Tolak'}
          </button>
        </div>
      )}
      {booking.status === 'accepted' && (
        <div className="vd-actions">
          <button className="vd-action-btn" style={{ background:'#3b82f6', flex:1 }} onClick={() => onComplete(booking.id)} disabled={isActioning}>
            {isActioning ? 'Memproses...' : 'Tandai Selesai'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Edit Profile Form ────────────────────────────────── */
function EditProfileForm({ vendor, onSaved }) {
  const [form, setForm] = useState({
    name:      vendor.name      || '',
    bio:       vendor.bio       || '',
    phone:     vendor.phone     || '',
    price:     vendor.price     || '',
    eta_hours: vendor.eta_hours || '',
    tags:      (vendor.tags || []).join(', '),
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState('')

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError('') }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setIsLoading(true)
    try {
      await vendorAPI.updateProfile({
        name:      form.name,
        bio:       form.bio,
        phone:     form.phone,
        price:     parseInt(form.price),
        eta_hours: parseInt(form.eta_hours),
        tags:      form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      })
      onSaved({ name: form.name, bio: form.bio, phone: form.phone, price: parseInt(form.price), eta_hours: parseInt(form.eta_hours) })
    } catch (err) { setError(err.message) }
    finally { setIsLoading(false) }
  }

  return (
    <div className="vd-card" style={{ maxWidth: '600px' }}>
      <h2 className="vd-section-title">Edit Profil Bisnis</h2>
      <p style={{ fontSize: '13px', color: 'var(--gray-400)', marginBottom: '1.5rem' }}>
        Perubahan akan langsung terlihat oleh calon customer.
      </p>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label">Nama Bisnis / Layanan</label>
          <input className="form-input" name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div className="form-field">
            <label className="form-label">Harga Mulai (Rp)</label>
            <input className="form-input" name="price" type="number" min="10000" value={form.price} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label className="form-label">Estimasi Pengerjaan (Jam)</label>
            <input className="form-input" name="eta_hours" type="number" min="1" value={form.eta_hours} onChange={handleChange} required />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label">No. Telepon (WhatsApp)</label>
          <input className="form-input" name="phone" value={form.phone} onChange={handleChange} required />
        </div>

        <div className="form-field">
          <label className="form-label">Tags (pisahkan dengan koma)</label>
          <input className="form-input" name="tags" value={form.tags} onChange={handleChange} placeholder="contoh: profesional, cepat, terpercaya" />
        </div>

        <div className="form-field" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Deskripsi Layanan</label>
          <textarea className="form-input" name="bio" value={form.bio} onChange={handleChange}
            style={{ minHeight: '90px', resize: 'vertical' }}
            placeholder="Ceritakan keunggulan layanan Anda..." />
        </div>

        <button className="btn-primary" type="submit" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
        </button>
      </form>
    </div>
  )
}
