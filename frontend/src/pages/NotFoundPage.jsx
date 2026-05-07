// src/pages/NotFoundPage.jsx
// Ditampilkan kalau user akses URL yang tidak ada

import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="auth-center-page">
      <div className="auth-center-card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <div style={{
          fontSize: '120px',
          fontWeight: '900',
          lineHeight: '1',
          background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '1rem',
          letterSpacing: '-0.05em'
        }}>
          404
        </div>
        <h1 className="auth-card-title" style={{ fontSize: '28px', marginBottom: '12px' }}>
          Halaman Tidak Ditemukan
        </h1>
        <p className="auth-card-subtitle" style={{ fontSize: '16px', marginBottom: '2.5rem' }}>
          Maaf, URL yang Anda akses tidak tersedia atau telah dipindahkan.
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            className="btn-primary" 
            onClick={() => navigate('/')}
            style={{ maxWidth: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Kembali ke Beranda
          </button>
        </div>
      </div>
    </div>
  )
}