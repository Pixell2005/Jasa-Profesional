// src/pages/MyBookingPage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../api/client'
import Navbar from '../components/Navbar'

const STATUS = {
  pending:     { label: 'Menunggu Konfirmasi', color: '#b45309', bg: '#fffbeb', border: '#fde68a' },
  confirmed:   { label: 'Dikonfirmasi',       color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  accepted:    { label: 'Diterima Vendor',    color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe' },
  in_progress: { label: 'Dalam Proses',       color: '#4338ca', bg: '#e0e7ff', border: '#c7d2fe' },
  completed:   { label: 'Selesai',            color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0' },
  cancelled:   { label: 'Dibatalkan',         color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
  rejected:    { label: 'Ditolak Vendor',     color: '#b91c1c', bg: '#fef2f2', border: '#fecaca' },
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
    <div style={{minHeight:'100vh', background:'var(--gray-50)'}}>
      <Navbar />

      <div style={{maxWidth:'800px', margin:'0 auto', padding:'3rem 2rem'}}>
        {/* Header */}
        <div style={{marginBottom:'2.5rem'}}>
          <button
            onClick={() => navigate('/')}
            style={{
              display:'inline-flex', alignItems:'center', gap:'6px',
              background:'none', border:'none', cursor:'pointer',
              fontSize:'13px', color:'var(--gray-500)', fontWeight:'600', padding:0,
              marginBottom:'1.25rem', transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--navy)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--gray-500)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Kembali ke Beranda
          </button>
          <h1 style={{
            fontSize:'32px', fontWeight:'800', color:'var(--navy)',
            letterSpacing:'-0.03em', marginBottom:'6px',
          }}>
            Booking Saya
          </h1>
          <p style={{color:'var(--gray-500)', fontSize:'15px'}}>
            Lacak status pesanan Anda dan kelola riwayat layanan profesional Anda.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{textAlign:'center', padding:'5rem 0', color:'var(--gray-400)', fontSize:'15px'}}>
            <div style={{
              width: '40px', height: '40px', border: '3px solid var(--gray-200)', 
              borderTopColor: 'var(--blue)', borderRadius: '50%', margin: '0 auto 1rem',
              animation: 'spin 1s linear infinite'
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Memuat data booking...
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>
        )}

        {/* Empty */}
        {!isLoading && !error && bookings.length === 0 && (
          <div style={{
            textAlign:'center', padding:'5rem 2rem',
            background:'#fff', borderRadius:'16px', border:'1px solid var(--gray-200)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5"
              style={{margin:'0 auto 1.25rem', display:'block'}}>
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1" ry="1"/>
              <line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/>
            </svg>
            <p style={{fontSize:'16px', fontWeight:'600', color:'var(--gray-500)', marginBottom:'0.75rem'}}>
              Belum ada pesanan aktif
            </p>
            <p style={{fontSize:'14px', color:'var(--gray-400)', marginBottom:'1.75rem'}}>
              Temukan vendor profesional dan buat pesanan layanan pertama Anda.
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn-primary"
              style={{ maxWidth: '200px', display: 'inline-block' }}
            >
              Cari Layanan
            </button>
          </div>
        )}

        {/* Active bookings */}
        {activeBookings.length > 0 && (
          <div style={{marginBottom:'3rem'}}>
            <h2 style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize:'13px', fontWeight:'700', color:'var(--gray-400)',
              textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'1.25rem',
            }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--blue)', borderRadius: '50%' }} />
              Sedang Berjalan — {activeBookings.length} Pesanan
            </h2>
            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
              {activeBookings.map(b => <BookingCard key={b.id} booking={b} />)}
            </div>
          </div>
        )}

        {/* Completed bookings */}
        {completedBookings.length > 0 && (
          <div>
            <h2 style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              fontSize:'13px', fontWeight:'700', color:'var(--gray-400)',
              textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'1.25rem',
            }}>
              <div style={{ width: '8px', height: '8px', background: 'var(--gray-300)', borderRadius: '50%' }} />
              Riwayat Selesai — {completedBookings.length} Pesanan
            </h2>
            <div style={{display:'flex', flexDirection:'column', gap:'16px'}}>
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
  return (
    <div style={{
      background:'#fff', borderRadius:'16px',
      border:'1px solid var(--gray-200)',
      padding:'1.75rem',
      boxShadow:'0 2px 10px rgba(0,0,0,0.02)',
      transition: 'box-shadow 0.2s, transform 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.02)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem', marginBottom:'16px'}}>
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
            <div style={{fontSize:'11px', fontWeight:'700', color:'var(--gray-400)', letterSpacing:'0.06em', background: 'var(--gray-100)', padding: '2px 6px', borderRadius: '4px'}}>
              #{booking.id.slice(0,8).toUpperCase()}
            </div>
            {['pending', 'accepted', 'confirmed'].includes(booking.status) && (
              <div style={{ fontSize: '11px', color: 'var(--blue)', fontWeight: '600' }}>
                Pesanan Baru
              </div>
            )}
          </div>
          
          <div style={{fontSize:'18px', fontWeight:'800', color:'var(--navy)', letterSpacing:'-0.01em', marginBottom: '4px'}}>
            {new Date(booking.service_date).toLocaleDateString('id-ID', {
              weekday:'long', day:'numeric', month:'long', year:'numeric'
            })}
          </div>
          <div style={{fontSize:'14px', color:'var(--gray-500)', fontWeight: '500'}}>
            <span style={{ color: 'var(--blue)' }}>Pukul {booking.service_time}</span>
          </div>
        </div>
        
        <span style={{
          display:'inline-block', padding:'6px 12px', borderRadius:'8px',
          fontSize:'12px', fontWeight:'700', flexShrink:0,
          color: st.color, background: st.bg, border: `1px solid ${st.border}`,
        }}>
          {st.label}
        </span>
      </div>

      <div style={{
        display:'flex', alignItems:'flex-start', gap:'10px',
        fontSize:'13.5px', color:'var(--gray-600)', lineHeight: '1.5',
        paddingTop:'16px', borderTop:'1px solid var(--gray-100)',
        marginBottom:'16px',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gray-400)" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: '2px' }}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
        </svg>
        {booking.address}
      </div>

      <div style={{
        background: 'var(--gray-50)', borderRadius: '12px', padding: '16px',
        display:'flex', justifyContent:'space-between', alignItems:'center',
      }}>
        <div>
          <div style={{fontSize:'12px', color:'var(--gray-500)', fontWeight:'600', marginBottom: '2px', textTransform: 'uppercase', letterSpacing: '0.05em'}}>Total Pembayaran</div>
          <div style={{fontSize:'22px', fontWeight:'800', color:'var(--navy)', letterSpacing:'-0.02em'}}>
            Rp {booking.total_price?.toLocaleString('id-ID')}
          </div>
        </div>
        {booking.admin_fee > 0 && (
          <div style={{fontSize:'12px', color:'var(--gray-400)', textAlign:'right', lineHeight: '1.5'}}>
            Termasuk biaya platform<br />
            <strong style={{ color: 'var(--gray-600)' }}>Rp {booking.admin_fee?.toLocaleString('id-ID')}</strong>
          </div>
        )}
      </div>
    </div>
  )
}