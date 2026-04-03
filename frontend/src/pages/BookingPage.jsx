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
        // TIDAK mengirim total_price — dihitung di backend
        // Ini mencegah manipulasi harga dari frontend
      })
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingVendor) return <div style={styles.center}>Memuat...</div>
  if (!vendor) return <div style={styles.center}>Vendor tidak ditemukan</div>

  // Tampilan setelah booking berhasil
  if (success) {
    return (
      <div style={styles.center}>
        <div style={styles.successBox}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>✅</div>
          <h2 style={{ fontWeight: '500', marginBottom: '8px' }}>Booking Berhasil!</h2>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '1.5rem' }}>
            Vendor akan segera menghubungi Anda.
          </p>
          <button style={styles.btn} onClick={() => navigate('/bookings')}>
            Lihat Booking Saya
          </button>
        </div>
      </div>
    )
  }

  const adminFee = 10000
  const totalPrice = vendor.price + adminFee

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Tombol kembali */}
        <button style={styles.backBtn} onClick={() => navigate('/')}>
          ← Kembali
        </button>

        <h1 style={styles.title}>Form Booking</h1>

        {/* Info vendor */}
        <div style={styles.vendorCard}>
          <div style={styles.vendorAvatar}>{vendor.name.slice(0, 2).toUpperCase()}</div>
          <div>
            <div style={{ fontWeight: '500' }}>{vendor.name}</div>
            <div style={{ fontSize: '13px', color: '#888' }}>{vendor.role}</div>
          </div>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Tanggal Layanan</label>
              <input style={styles.input} type="date" name="service_date"
                value={form.service_date} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]} // tidak bisa pilih masa lalu
                required />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Jam Mulai</label>
              <input style={styles.input} type="time" name="service_time"
                value={form.service_time} onChange={handleChange} required />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Alamat Lengkap</label>
            <input style={styles.input} type="text" name="address"
              value={form.address} onChange={handleChange}
              placeholder="Jl. ..." required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Catatan (opsional)</label>
            <textarea style={{ ...styles.input, height: '80px', resize: 'vertical' }}
              name="notes" value={form.notes} onChange={handleChange}
              placeholder="Detail pekerjaan atau kondisi lokasi..." />
          </div>

          {/* Ringkasan harga */}
          <div style={styles.summary}>
            <div style={styles.summaryRow}>
              <span>Biaya layanan</span>
              <span>Rp {vendor.price.toLocaleString('id-ID')}</span>
            </div>
            <div style={styles.summaryRow}>
              <span>Biaya admin</span>
              <span>Rp {adminFee.toLocaleString('id-ID')}</span>
            </div>
            <div style={{ ...styles.summaryRow, ...styles.summaryTotal }}>
              <span>Total</span>
              <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button style={styles.btn} type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Konfirmasi Booking'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f0', padding: '2rem 1rem', fontFamily: 'sans-serif' },
  container: { maxWidth: '520px', margin: '0 auto' },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', flexDirection: 'column' },
  backBtn: { background: 'none', border: 'none', fontSize: '14px', color: '#666', cursor: 'pointer', padding: '0', marginBottom: '1rem' },
  title: { fontSize: '20px', fontWeight: '500', marginBottom: '1.5rem' },
  vendorCard: {
    display: 'flex', gap: '12px', alignItems: 'center',
    background: '#fff', borderRadius: '10px', padding: '1rem',
    border: '0.5px solid #e0e0e0', marginBottom: '1.5rem',
  },
  vendorAvatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: '#e8f0fe', color: '#3b5bdb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '500', flexShrink: 0,
  },
  errorBox: {
    background: '#fff0f0', color: '#c0392b', border: '0.5px solid #f5c6cb',
    borderRadius: '8px', padding: '10px 14px', fontSize: '13px', marginBottom: '1rem',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '4px' },
  input: {
    width: '100%', padding: '10px 12px', fontSize: '14px',
    border: '0.5px solid #ccc', borderRadius: '8px',
    boxSizing: 'border-box', outline: 'none', fontFamily: 'sans-serif',
  },
  summary: {
    background: '#f9f9f9', borderRadius: '8px', padding: '1rem',
    marginBottom: '1rem', border: '0.5px solid #e0e0e0',
  },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', color: '#555' },
  summaryTotal: { fontWeight: '500', color: '#111', borderTop: '0.5px solid #ddd', marginTop: '6px', paddingTop: '8px' },
  btn: {
    width: '100%', padding: '12px', fontSize: '14px', fontWeight: '500',
    background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer',
  },
  successBox: {
    background: '#fff', borderRadius: '12px', padding: '3rem 2rem',
    textAlign: 'center', border: '0.5px solid #e0e0e0', maxWidth: '360px',
  },
}