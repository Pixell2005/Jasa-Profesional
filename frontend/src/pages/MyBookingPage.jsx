// src/pages/MyBookingsPage.jsx
// Halaman PROTECTED — hanya user yang login yang bisa akses
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { bookingAPI } from '../api/client'

const STATUS_LABEL = {
  pending:     { label: 'Menunggu',   color: '#f39c12', bg: '#fef9e7' },
  confirmed:   { label: 'Dikonfirmasi', color: '#27ae60', bg: '#eafaf1' },
  in_progress: { label: 'Dalam Proses', color: '#2980b9', bg: '#ebf5fb' },
  completed:   { label: 'Selesai',    color: '#7f8c8d', bg: '#f2f3f4' },
  cancelled:   { label: 'Dibatalkan', color: '#e74c3c', bg: '#fdedec' },
}

export default function MyBookingsPage() {
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    bookingAPI.getMyBookings()
      .then((res) => setBookings(res.data))
      .catch(() => setError('Gagal memuat riwayat booking'))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button style={styles.backBtn} onClick={() => navigate('/')}>← Kembali</button>
        <h1 style={styles.title}>Booking Saya</h1>

        {isLoading && <p style={styles.info}>Memuat...</p>}
        {error && <p style={styles.error}>{error}</p>}

        {!isLoading && bookings.length === 0 && (
          <div style={styles.emptyBox}>
            <p style={{ color: '#888', marginBottom: '1rem' }}>Belum ada booking.</p>
            <button style={styles.btn} onClick={() => navigate('/')}>Cari Vendor</button>
          </div>
        )}

        <div style={styles.list}>
          {bookings.map((b) => {
            const status = STATUS_LABEL[b.status] || STATUS_LABEL.pending
            return (
              <div key={b.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div>
                    <div style={styles.bookingId}>#{b.id.slice(0, 8).toUpperCase()}</div>
                    <div style={styles.date}>{b.service_date} pukul {b.service_time}</div>
                  </div>
                  <span style={{ ...styles.badge, color: status.color, background: status.bg }}>
                    {status.label}
                  </span>
                </div>
                <div style={styles.address}>📍 {b.address}</div>
                <div style={styles.cardBottom}>
                  <span style={styles.total}>
                    Rp {b.total_price.toLocaleString('id-ID')}
                  </span>
                  <span style={styles.adminFee}>
                    (termasuk admin Rp {b.admin_fee.toLocaleString('id-ID')})
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f0', padding: '2rem 1rem', fontFamily: 'sans-serif' },
  container: { maxWidth: '600px', margin: '0 auto' },
  backBtn: { background: 'none', border: 'none', fontSize: '14px', color: '#666', cursor: 'pointer', padding: 0, marginBottom: '1rem' },
  title: { fontSize: '20px', fontWeight: '500', marginBottom: '1.5rem' },
  info: { color: '#888', fontSize: '14px' },
  error: { color: '#e74c3c', fontSize: '14px' },
  emptyBox: { textAlign: 'center', padding: '3rem 0' },
  list: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: '#fff', borderRadius: '10px', padding: '1.25rem', border: '0.5px solid #e0e0e0' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  bookingId: { fontWeight: '500', fontSize: '14px' },
  date: { fontSize: '13px', color: '#666', marginTop: '2px' },
  badge: { padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: '500' },
  address: { fontSize: '13px', color: '#555', marginBottom: '10px' },
  cardBottom: { display: 'flex', alignItems: 'baseline', gap: '6px' },
  total: { fontWeight: '500', fontSize: '14px' },
  adminFee: { fontSize: '11px', color: '#aaa' },
  btn: {
    padding: '10px 20px', fontSize: '14px', fontWeight: '500',
    background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
  },
}