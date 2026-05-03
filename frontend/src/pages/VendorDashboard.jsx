// src/pages/VendorDashboard.jsx
import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { vendorAPI } from '../api/client'

const STATUS_COLORS = {
  pending: '#ff9800',
  accepted: '#4caf50',
  rejected: '#f44336',
  completed: '#2196f3',
}

export default function VendorDashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const [bookings, setBookings] = useState([])
  const [vendor, setVendor] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '')
  const [actioningBookingId, setActioningBookingId] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError('')

      // Get vendor profile
      const vendorRes = await vendorAPI.getProfile()
      if (vendorRes.success) {
        setVendor(vendorRes.data)
      } else {
        throw new Error('Anda bukan vendor')
      }

      // Get bookings
      const bookingsRes = await vendorAPI.getBookings()
      if (bookingsRes.success) {
        setBookings(bookingsRes.data || [])
      }
    } catch (err) {
      setError(err.message)
      if (err.message.includes('vendor')) {
        navigate('/vendor/register')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccept = async (bookingId) => {
    setActioningBookingId(bookingId)
    try {
      const res = await vendorAPI.acceptBooking(bookingId)
      if (res.success) {
        setBookings(bookings.map(b => 
          b.id === bookingId ? {...b, status: 'accepted'} : b
        ))
        setSuccessMessage('Booking diterima!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningBookingId(null)
    }
  }

  const handleReject = async (bookingId) => {
    if (!window.confirm('Yakin ingin menolak booking ini?')) return
    
    setActioningBookingId(bookingId)
    try {
      const res = await vendorAPI.rejectBooking(bookingId)
      if (res.success) {
        setBookings(bookings.map(b => 
          b.id === bookingId ? {...b, status: 'rejected'} : b
        ))
        setSuccessMessage('Booking ditolak')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningBookingId(null)
    }
  }

  const handleComplete = async (bookingId) => {
    setActioningBookingId(bookingId)
    try {
      const res = await vendorAPI.completeBooking(bookingId)
      if (res.success) {
        setBookings(bookings.map(b => 
          b.id === bookingId ? {...b, status: 'completed'} : b
        ))
        setSuccessMessage('Booking diselesaikan!')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setActioningBookingId(null)
    }
  }

  if (isLoading) {
    return <div style={styles.page}><div style={styles.card}><p>Loading...</p></div></div>
  }

  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const acceptedBookings = bookings.filter(b => b.status === 'accepted')
  const completedBookings = bookings.filter(b => b.status === 'completed')

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.headerTitle}>👔 Vendor Dashboard</h1>
          {vendor && <p style={styles.headerSubtitle}>{vendor.name} • {vendor.category}</p>}
        </div>
        <button style={styles.logoutButton} onClick={logout}>
          Logout
        </button>
      </div>

      {/* Messages */}
      {successMessage && <div style={styles.successBox}>{successMessage}</div>}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Main Content */}
      <div style={styles.container}>
        {/* Stats */}
        {vendor && (
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Rating</p>
              <p style={styles.statValue}>⭐ {vendor.rating?.toFixed(1) || '0.0'}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Pending</p>
              <p style={styles.statValue}>{pendingBookings.length}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Accepted</p>
              <p style={styles.statValue}>{acceptedBookings.length}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Completed</p>
              <p style={styles.statValue}>{completedBookings.length}</p>
            </div>
          </div>
        )}

        {/* Bookings */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>📋 Booking Masuk</h2>

          {bookings.length === 0 ? (
            <p style={styles.emptyState}>Belum ada booking</p>
          ) : (
            <div>
              {/* Pending Bookings */}
              {pendingBookings.length > 0 && (
                <div style={styles.bookingSection}>
                  <h3 style={styles.subsectionTitle}>⏳ Menunggu Respon</h3>
                  {pendingBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      isActioning={actioningBookingId === booking.id}
                    />
                  ))}
                </div>
              )}

              {/* Accepted Bookings */}
              {acceptedBookings.length > 0 && (
                <div style={styles.bookingSection}>
                  <h3 style={styles.subsectionTitle}>✅ Diterima</h3>
                  {acceptedBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking}
                      onComplete={handleComplete}
                      isActioning={actioningBookingId === booking.id}
                    />
                  ))}
                </div>
              )}

              {/* Completed Bookings */}
              {completedBookings.length > 0 && (
                <div style={styles.bookingSection}>
                  <h3 style={styles.subsectionTitle}>🎉 Selesai</h3>
                  {completedBookings.map(booking => (
                    <BookingCard 
                      key={booking.id} 
                      booking={booking}
                      isActioning={actioningBookingId === booking.id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function BookingCard({ booking, onAccept, onReject, onComplete, isActioning }) {
  const statusColor = STATUS_COLORS[booking.status] || '#666'

  return (
    <div style={styles.bookingCard}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px'}}>
        <div>
          <p style={styles.bookingDate}>
            📅 {new Date(booking.service_date).toLocaleDateString('id-ID')} 
            {' '} 🕐 {booking.service_time}
          </p>
          <p style={styles.bookingStatus}>
            Status: <span style={{...styles.statusBadge, backgroundColor: statusColor}}>
              {booking.status.toUpperCase()}
            </span>
          </p>
        </div>
        <p style={styles.bookingPrice}>Rp {booking.total_price?.toLocaleString('id-ID')}</p>
      </div>

      <p style={styles.bookingAddress}><strong>📍 Lokasi:</strong> {booking.address}</p>
      {booking.notes && <p style={styles.bookingNotes}><strong>📝 Catatan:</strong> {booking.notes}</p>}

      {booking.status === 'pending' && (
        <div style={styles.actionButtons}>
          <button 
            style={{...styles.actionButton, backgroundColor: '#4caf50'}}
            onClick={() => onAccept(booking.id)}
            disabled={isActioning}
          >
            {isActioning ? 'Processing...' : '✓ Terima'}
          </button>
          <button 
            style={{...styles.actionButton, backgroundColor: '#f44336'}}
            onClick={() => onReject(booking.id)}
            disabled={isActioning}
          >
            {isActioning ? 'Processing...' : '✗ Tolak'}
          </button>
        </div>
      )}

      {booking.status === 'accepted' && (
        <button 
          style={{...styles.actionButton, backgroundColor: '#2196f3', width: '100%'}}
          onClick={() => onComplete(booking.id)}
          disabled={isActioning}
        >
          {isActioning ? 'Processing...' : '✓ Selesaikan'}
        </button>
      )}
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f0',
    padding: '2rem 1rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    maxWidth: '1000px',
    margin: '0 auto 2rem',
  },
  headerTitle: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0',
  },
  headerSubtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '4px 0 0',
  },
  logoutButton: {
    padding: '8px 16px',
    fontSize: '13px',
    background: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    background: '#fff',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '0.5px solid #e0e0e0',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    margin: '0 0 8px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '600',
    margin: '0',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    border: '0.5px solid #e0e0e0',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 1.5rem',
  },
  subsectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    margin: '1.5rem 0 1rem',
    borderTop: '1px solid #eee',
    paddingTop: '1rem',
  },
  boardingSection: {
    marginBottom: '2rem',
  },
  bookingCard: {
    background: '#fafafa',
    padding: '1rem',
    borderRadius: '6px',
    border: '0.5px solid #e0e0e0',
    marginBottom: '1rem',
  },
  bookingDate: {
    fontSize: '14px',
    fontWeight: '500',
    margin: '0 0 8px',
  },
  bookingStatus: {
    fontSize: '13px',
    margin: '0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statusBadge: {
    color: '#fff',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  bookingPrice: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0',
  },
  bookingAddress: {
    fontSize: '13px',
    margin: '1rem 0 0.5rem',
  },
  bookingNotes: {
    fontSize: '13px',
    margin: '0.5rem 0',
    color: '#666',
  },
  actionButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  actionButton: {
    flex: 1,
    padding: '8px 12px',
    fontSize: '13px',
    fontWeight: '500',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
    padding: '2rem',
  },
  successBox: {
    background: '#c8e6c9',
    color: '#2e7d32',
    border: '0.5px solid #a5d6a7',
    borderRadius: '6px',
    padding: '12px 16px',
    marginBottom: '1rem',
    fontSize: '14px',
    textAlign: 'center',
  },
  errorBox: {
    background: '#ffcdd2',
    color: '#c62828',
    border: '0.5px solid #ef9a9a',
    borderRadius: '6px',
    padding: '12px 16px',
    marginBottom: '1rem',
    fontSize: '14px',
    textAlign: 'center',
  },
  bookingSection: {
    marginBottom: '1rem',
  },
}
