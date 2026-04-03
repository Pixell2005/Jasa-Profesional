// src/pages/RegisterPage.jsx
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validasi di frontend sebelum kirim ke server
    if (form.password !== form.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok')
      return
    }
    if (form.password.length < 8) {
      setError('Password minimal 8 karakter')
      return
    }

    setIsLoading(true)
    try {
      await register(form.name, form.email, form.password)
      // Setelah register berhasil, arahkan ke login
      navigate('/login', { state: { message: 'Registrasi berhasil! Silakan masuk.' } })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>🛠️ Daftar Akun</h1>
        <p style={styles.subtitle}>Mulai booking jasa profesional</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Nama Lengkap</label>
            <input style={styles.input} type="text" name="name"
              value={form.name} onChange={handleChange}
              placeholder="Nama Anda" required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input style={styles.input} type="email" name="email"
              value={form.email} onChange={handleChange}
              placeholder="email@contoh.com" required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input style={styles.input} type="password" name="password"
              value={form.password} onChange={handleChange}
              placeholder="Minimal 8 karakter" required />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Konfirmasi Password</label>
            <input style={styles.input} type="password" name="confirmPassword"
              value={form.confirmPassword} onChange={handleChange}
              placeholder="Ulangi password" required />
          </div>

          <button style={styles.button} type="submit" disabled={isLoading}>
            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p style={styles.footer}>
          Sudah punya akun?{' '}
          <Link to="/login" style={styles.link}>Masuk di sini</Link>
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