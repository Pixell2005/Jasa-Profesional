// src/pages/HomePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { vendorAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const CATEGORIES = [
  { value: '', label: 'Semua' },
  { value: 'cleaning', label: 'Kebersihan' },
  { value: 'electric', label: 'Listrik & AC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'design', label: 'Desain Interior' },
  { value: 'moving', label: 'Pindahan' },
  { value: 'pest', label: 'Pest Control' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const [vendors, setVendors] = useState([])
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setIsLoading(true)
    vendorAPI.getAll(category)
      .then((res) => setVendors(res.data || []))
      .catch(() => setError('Gagal memuat data vendor'))
      .finally(() => setIsLoading(false))
  }, [category])

  const handleBooking = (vendorId) => {
    if (!isLoggedIn) {
      navigate('/login')
      return
    }
    navigate(`/booking/${vendorId}`)
  }

  return (
    <div style={styles.page}>
      <Navbar />

      <div style={styles.content}>
        <h2 style={styles.heading}>Temukan Jasa Profesional</h2>

        {/* Filter kategori */}
        <div style={styles.categories}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              style={{ ...styles.chip, ...(category === cat.value ? styles.chipActive : {}) }}
              onClick={() => setCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Daftar vendor */}
        {isLoading && <p style={styles.info}>Memuat vendor...</p>}
        {error && <p style={styles.errorText}>{error}</p>}

        {!isLoading && !error && (
          <div style={styles.grid}>
            {vendors.length === 0 && (
              <p style={styles.info}>Tidak ada vendor untuk kategori ini.</p>
            )}
            {vendors.map((v) => (
              <div key={v.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <div style={styles.avatar}>{v.name.slice(0, 2).toUpperCase()}</div>
                  <div>
                    <div style={styles.vendorName}>{v.name}</div>
                    <div style={styles.vendorRole}>{v.role}</div>
                  </div>
                </div>

                <div style={styles.tags}>
                  {(v.tags || []).map((tag) => (
                    <span key={tag} style={styles.tag}>{tag}</span>
                  ))}
                </div>

                <div style={styles.cardMeta}>
                  <span>⭐ {v.rating} ({v.review_count})</span>
                  <span style={styles.price}>Rp {v.price.toLocaleString('id-ID')}</span>
                </div>

                <div style={styles.eta}>
                  ⏱ {v.eta_hours < 24
                    ? `Estimasi ${v.eta_hours} jam`
                    : `Estimasi ${Math.round(v.eta_hours / 24)} hari`}
                </div>

                <button style={styles.bookBtn} onClick={() => handleBooking(v.id)}>
                  Booking Sekarang
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f5f5f0', fontFamily: 'sans-serif' },
  content: { maxWidth: '960px', margin: '0 auto', padding: '2rem 1rem' },
  heading: { fontSize: '20px', fontWeight: '500', marginBottom: '1.5rem', color: '#111' },
  categories: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' },
  chip: {
    padding: '6px 14px', borderRadius: '999px', fontSize: '13px',
    border: '0.5px solid #ccc', background: '#fff', cursor: 'pointer', fontFamily: 'sans-serif',
  },
  chipActive: { background: '#111', color: '#fff', border: '0.5px solid #111' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' },
  card: { background: '#fff', borderRadius: '12px', padding: '1.25rem', border: '0.5px solid #e0e0e0' },
  cardTop: { display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' },
  avatar: {
    width: '40px', height: '40px', borderRadius: '50%',
    background: '#e8f0fe', color: '#3b5bdb',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: '500', fontSize: '13px', flexShrink: 0,
  },
  vendorName: { fontWeight: '500', fontSize: '14px' },
  vendorRole: { fontSize: '12px', color: '#888' },
  tags: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' },
  tag: { padding: '2px 8px', fontSize: '11px', borderRadius: '6px', background: '#f0f0f0', color: '#555' },
  cardMeta: { display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666', marginBottom: '4px' },
  price: { fontWeight: '500', color: '#111' },
  eta: { fontSize: '11px', color: '#27ae60', marginBottom: '12px' },
  bookBtn: {
    width: '100%', padding: '9px', fontSize: '13px', fontWeight: '500',
    background: '#111', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontFamily: 'sans-serif',
  },
  info: { color: '#888', fontSize: '14px' },
  errorText: { color: '#e74c3c', fontSize: '14px' },
}