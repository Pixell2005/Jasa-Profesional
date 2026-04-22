// src/pages/VendorRegisterPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { vendorAPI } from '../api/client'

const CATEGORIES = [
  'Cleaning',
  'Plumbing',
  'Electrical',
  'Carpentry',
  'Painting',
  'Pest Control',
  'Landscaping',
  'HVAC',
  'Other'
]

export default function VendorRegisterPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [form, setForm] = useState({
    name: '',
    category: '',
    bio: '',
    phone: '',
    price: '',
    etaHours: '',
    tags: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (!user) {
    return (
      <div style={styles.page}>
        <div style={styles.card}>
          <p style={styles.errorBox}>Silakan login terlebih dahulu untuk mendaftar sebagai vendor</p>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validasi
    if (!form.name || !form.category || !form.phone || !form.price || !form.etaHours) {
      setError('Semua field wajib diisi')
      return
    }

    if (parseInt(form.price) < 10000) {
      setError('Harga minimum Rp 10.000')
      return
    }

    if (parseInt(form.etaHours) < 1) {
      setError('Waktu estimasi minimal 1 jam')
      return
    }

    setIsLoading(true)
    try {
      const payload = {
        name: form.name,
        category: form.category,
        bio: form.bio,
        phone: form.phone,
        price: parseInt(form.price),
        eta_hours: parseInt(form.etaHours),
        tags: form.tags ? form.tags.split(',').map(t => t.trim()) : []
      }

      const res = await vendorAPI.register(payload)
      if (res.success) {
        navigate('/vendor/dashboard', { 
          state: { message: 'Registrasi vendor berhasil! Selamat datang di dashboard vendor.' } 
        })
      }
    } catch (err) {
      setError(err.message || 'Gagal mendaftar vendor')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>💼 Daftar Sebagai Vendor</h1>
        <p style={styles.subtitle}>Mulai menerima pesanan layanan</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Nama Bisnis</label>
            <input 
              style={styles.input} 
              type="text" 
              name="name"
              value={form.name} 
              onChange={handleChange}
              placeholder="Nama layanan Anda" 
              required 
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Kategori Layanan</label>
            <select 
              style={styles.input} 
              name="category"
              value={form.category} 
              onChange={handleChange}
              required
            >
              <option value="">Pilih kategori</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Deskripsi / Bio</label>
            <textarea 
              style={{...styles.input, minHeight: '80px', resize: 'vertical'}}
              name="bio"
              value={form.bio} 
              onChange={handleChange}
              placeholder="Deskripsikan layanan Anda..." 
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>No. Telepon</label>
            <input 
              style={styles.input} 
              type="tel" 
              name="phone"
              value={form.phone} 
              onChange={handleChange}
              placeholder="08xxxxxxxxx" 
              required 
            />
          </div>

          <div style={styles.row}>
            <div style={{...styles.field, flex: 1, marginRight: '0.5rem'}}>
              <label style={styles.label}>Harga (Rp)</label>
              <input 
                style={styles.input} 
                type="number" 
                name="price"
                value={form.price} 
                onChange={handleChange}
                placeholder="100000" 
                min="10000"
                required 
              />
            </div>
            <div style={{...styles.field, flex: 1}}>
              <label style={styles.label}>Waktu (Jam)</label>
              <input 
                style={styles.input} 
                type="number" 
                name="etaHours"
                value={form.etaHours} 
                onChange={handleChange}
                placeholder="2" 
                min="1"
                required 
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Tags (dipisah koma)</label>
            <input 
              style={styles.input} 
              type="text" 
              name="tags"
              value={form.tags} 
              onChange={handleChange}
              placeholder="profesional, berpengalaman, cepat" 
            />
          </div>

          <button style={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Daftar Vendor'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', 
    display: 'flex',
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: '#f5f5f0', 
    padding: '1rem',
  },
  card: {
    background: '#fff', 
    borderRadius: '12px',
    padding: '2.5rem', 
    width: '100%', 
    maxWidth: '500px',
    border: '0.5px solid #e0e0e0',
  },
  title: { 
    fontSize: '22px', 
    fontWeight: '500', 
    margin: '0 0 4px' 
  },
  subtitle: { 
    color: '#888', 
    fontSize: '14px', 
    margin: '0 0 1.5rem' 
  },
  errorBox: {
    background: '#fff0f0', 
    color: '#c0392b',
    border: '0.5px solid #f5c6cb', 
    borderRadius: '8px',
    padding: '10px 14px', 
    fontSize: '13px', 
    marginBottom: '1rem',
  },
  field: { 
    marginBottom: '1rem' 
  },
  row: {
    display: 'flex',
    gap: '0.5rem'
  },
  label: { 
    display: 'block', 
    fontSize: '13px', 
    color: '#555', 
    marginBottom: '4px' 
  },
  input: {
    width: '100%', 
    padding: '10px 12px', 
    fontSize: '14px',
    border: '0.5px solid #ccc', 
    borderRadius: '8px',
    boxSizing: 'border-box', 
    outline: 'none',
    fontFamily: 'inherit',
  },
  button: {
    width: '100%', 
    padding: '12px', 
    fontSize: '14px',
    fontWeight: '500', 
    background: '#111', 
    color: '#fff',
    border: 'none', 
    borderRadius: '8px', 
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
}
