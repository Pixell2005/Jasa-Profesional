// src/pages/NotFoundPage.jsx
// Ditampilkan kalau user akses URL yang tidak ada

import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <div style={styles.code}>404</div>
        <h1 style={styles.title}>Halaman tidak ditemukan</h1>
        <p style={styles.desc}>URL yang kamu akses tidak ada.</p>
        <button style={styles.btn} onClick={() => navigate('/')}>
          Kembali ke Beranda
        </button>
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
    background: '#f5f5f0',
    fontFamily: 'sans-serif',
  },
  box: {
    textAlign: 'center',
    padding: '3rem 2rem',
  },
  code: {
    fontSize: '80px',
    fontWeight: '500',
    color: '#ddd',
    lineHeight: 1,
    marginBottom: '1rem',
  },
  title: {
    fontSize: '20px',
    fontWeight: '500',
    margin: '0 0 8px',
  },
  desc: {
    color: '#888',
    fontSize: '14px',
    margin: '0 0 2rem',
  },
  btn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '500',
    background: '#111',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
}