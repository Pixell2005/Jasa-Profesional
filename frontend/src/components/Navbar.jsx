// src/components/Navbar.jsx
// Komponen navbar yang dipakai di HomePage
// Dipisah supaya tidak perlu tulis ulang di setiap halaman

import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav style={styles.nav}>
      <span style={styles.brand} onClick={() => navigate('/')}>
        🛠️ Jasa Profesional
      </span>

      <div style={styles.right}>
        {isLoggedIn ? (
          <>
            <span style={styles.greeting}>Halo, {user?.name}</span>
            <button style={styles.btn} onClick={() => navigate('/bookings')}>
              Booking Saya
            </button>
            <button style={{ ...styles.btn, ...styles.btnDanger }} onClick={handleLogout}>
              Keluar
            </button>
          </>
        ) : (
          <>
            <button style={styles.btn} onClick={() => navigate('/login')}>
              Masuk
            </button>
            <button style={{ ...styles.btn, ...styles.btnDark }} onClick={() => navigate('/register')}>
              Daftar
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    background: '#fff',
    padding: '1rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '0.5px solid #e0e0e0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontWeight: '500',
    fontSize: '16px',
    cursor: 'pointer',
  },
  right: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  greeting: {
    fontSize: '13px',
    color: '#888',
    marginRight: '4px',
  },
  btn: {
    padding: '7px 14px',
    fontSize: '13px',
    borderRadius: '8px',
    border: '0.5px solid #ccc',
    background: '#fff',
    cursor: 'pointer',
    fontFamily: 'sans-serif',
  },
  btnDark: {
    background: '#111',
    color: '#fff',
    border: '0.5px solid #111',
  },
  btnDanger: {
    color: '#e74c3c',
    borderColor: '#e74c3c',
  },
}