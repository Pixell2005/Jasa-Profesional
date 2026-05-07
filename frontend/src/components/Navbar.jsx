// src/components/Navbar.jsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const navigate = useNavigate()
  const { isLoggedIn, user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
    setOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-mark">JP</div>
          <span className="navbar-brand-text">Jasa Profesional</span>
        </Link>

        {/* Actions */}
        <div className="navbar-actions">
          {isLoggedIn ? (
            <>
              {user?.role === 'customer' && (
                <Link to="/bookings" className="nav-link">Booking Saya</Link>
              )}
              {user?.role === 'vendor' && (
                <Link to="/vendor/dashboard" className="nav-link">Dashboard</Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="nav-link">Admin Panel</Link>
              )}
              {user?.role === 'customer' && (
                <Link to="/vendor/register" className="nav-link">Daftar Vendor</Link>
              )}

              {/* User dropdown */}
              <div className="user-menu">
                <button className="user-btn" onClick={() => setOpen(!open)}>
                  <div className="user-avatar">
                    {user?.name?.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="user-name">{user?.name}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"
                    style={{transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s'}}>
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </button>

                {open && (
                  <div className="dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-name">{user?.name}</div>
                      <div className="dropdown-email">{user?.email}</div>
                      <div className="dropdown-role">{user?.role}</div>
                    </div>

                    <div className="dropdown-divider"/>

                    <button className="dropdown-item" onClick={() => { navigate('/change-password'); setOpen(false) }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                      </svg>
                      Ganti Password
                    </button>

                    <div className="dropdown-divider"/>

                    <button className="dropdown-item danger" onClick={handleLogout}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Masuk</Link>
              <Link to="/register" className="nav-btn-primary">Daftar Gratis</Link>
            </>
          )}
        </div>
      </div>

      {/* Overlay to close dropdown */}
      {open && (
        <div style={{position:'fixed', inset:0, zIndex:199}} onClick={() => setOpen(false)} />
      )}
    </nav>
  )
}