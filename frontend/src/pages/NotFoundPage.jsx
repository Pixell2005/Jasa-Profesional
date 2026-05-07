// src/pages/NotFoundPage.jsx
import { useNavigate } from 'react-router-dom'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="notfound-page">
      <div className="notfound-card">
        <div className="notfound-number">404</div>
        <h1 className="notfound-title">Halaman Tidak Ditemukan</h1>
        <p className="notfound-desc">
          Maaf, URL yang Anda akses tidak tersedia atau telah dipindahkan ke lokasi lain.
        </p>
        <button className="btn-glass" onClick={() => navigate('/')}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Kembali ke Beranda
        </button>
      </div>
    </div>
  )
}