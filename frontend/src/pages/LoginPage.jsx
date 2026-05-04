// src/pages/LoginPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('') // hapus error saat user mulai mengetik
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const loggedInUser = await login(form.email, form.password)
      // Redirect berdasarkan role:
      // - admin → langsung ke panel admin
      // - vendor → langsung ke dashboard vendor
      // - customer → ke halaman utama
      if (loggedInUser?.role === 'admin') {
        navigate('/admin')
      } else if (loggedInUser?.role === 'vendor') {
        navigate('/vendor/dashboard')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🛠️ Jasa Profesional</h1>
        <p style={styles.subtitle}>Masuk ke akun Anda</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@contoh.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              required
            />
          </div>

          <button style={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <p style={styles.footer}>
          Belum punya akun?{' '}
          <Link to="/register" style={styles.link}>Daftar sekarang</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f5f5f0', padding: '1rem',
  },
  card: {
    background: '#fff', borderRadius: '12px',
    padding: '2.5rem', width: '100%', maxWidth: '400px',
    border: '0.5px solid #e0e0e0',
  },
  title: { fontSize: '22px', fontWeight: '500', margin: '0 0 4px' },
  subtitle: { color: '#888', fontSize: '14px', margin: '0 0 1.5rem' },
  errorBox: {
    background: '#fff0f0', color: '#c0392b',
    border: '0.5px solid #f5c6cb', borderRadius: '8px',
    padding: '10px 14px', fontSize: '13px', marginBottom: '1rem',
  },
  field: { marginBottom: '1rem' },
  label: { display: 'block', fontSize: '13px', color: '#555', marginBottom: '4px' },
  input: {
    width: '100%', padding: '10px 12px', fontSize: '14px',
    border: '0.5px solid #ccc', borderRadius: '8px',
    boxSizing: 'border-box', outline: 'none',
  },
  button: {
    width: '100%', padding: '12px', fontSize: '14px',
    fontWeight: '500', background: '#111', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer',
    marginTop: '0.5rem',
  },
  footer: { textAlign: 'center', fontSize: '13px', color: '#888', marginTop: '1.5rem' },
  link: { color: '#111', fontWeight: '500' },
}