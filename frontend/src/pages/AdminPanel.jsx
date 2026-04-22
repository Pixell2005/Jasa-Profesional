// src/pages/AdminPanel.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminAPI } from '../api/client'

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  const [dashboard, setDashboard] = useState(null)
  const [users, setUsers] = useState([])
  const [vendors, setVendors] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login')
      return
    }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setIsLoading(true)
      setError('')

      const [dashRes, usersRes, vendorsRes] = await Promise.all([
        adminAPI.getDashboard(),
        adminAPI.getAllUsers(),
        adminAPI.getAllVendors(),
      ])

      if (dashRes.success) {
        setDashboard(dashRes.data)
      }
      if (usersRes.success) {
        setUsers(usersRes.data || [])
      }
      if (vendorsRes.success) {
        setVendors(vendorsRes.data || [])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div style={styles.page}><div style={styles.card}><p>Loading...</p></div></div>
  }

  const totalCustomers = users.filter(u => u.role === 'customer').length
  const totalAdmins = users.filter(u => u.role === 'admin').length

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🔧 Admin Panel</h1>
        <button style={styles.logoutButton} onClick={logout}>
          Logout
        </button>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}

      {/* Navigation Tabs */}
      <div style={styles.tabs}>
        {['dashboard', 'users', 'vendors'].map(tab => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === tab ? '#111' : '#e0e0e0',
              color: activeTab === tab ? '#fff' : '#333',
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && dashboard && (
        <div style={styles.container}>
          <div style={styles.statsGrid}>
            <StatCard 
              label="Total Users" 
              value={dashboard.total_users}
              icon="👥"
            />
            <StatCard 
              label="Total Vendors" 
              value={dashboard.total_vendors}
              icon="💼"
            />
            <StatCard 
              label="Total Bookings" 
              value={dashboard.total_bookings}
              icon="📋"
            />
            <StatCard 
              label="Total Revenue" 
              value={`Rp ${(dashboard.total_revenue || 0).toLocaleString('id-ID')}`}
              icon="💰"
            />
            <StatCard 
              label="Pending Bookings" 
              value={dashboard.pending_bookings}
              icon="⏳"
            />
            <StatCard 
              label="Completed Bookings" 
              value={dashboard.completed_bookings}
              icon="✅"
            />
          </div>

          <div style={styles.card}>
            <h2 style={styles.cardTitle}>📊 Statistik Tambahan</h2>
            <div style={styles.statsDetail}>
              <p><strong>Rata-rata Rating Vendor:</strong> ⭐ {(dashboard.average_rating || 0).toFixed(1)}</p>
              <p><strong>Accepted Bookings:</strong> {dashboard.accepted_bookings}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div style={styles.container}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>👥 Semua Users ({users.length})</h2>
            
            <div style={styles.statsDetail}>
              <p>👤 Customers: <strong>{totalCustomers}</strong></p>
              <p>💼 Vendors: <strong>{vendors.length}</strong></p>
              <p>🔧 Admins: <strong>{totalAdmins}</strong></p>
            </div>

            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tableHeader}>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Tanggal Daftar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.id} style={styles.tableRow}>
                      <td>{idx + 1}</td>
                      <td>{user.name}</td>
                      <td style={styles.email}>{user.email}</td>
                      <td>
                        <span style={getRoleBadgeStyle(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          ...styles.badge,
                          backgroundColor: user.is_active ? '#4caf50' : '#f44336'
                        }}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Vendors Tab */}
      {activeTab === 'vendors' && (
        <div style={styles.container}>
          <div style={styles.card}>
            <h2 style={styles.cardTitle}>💼 Semua Vendors ({vendors.length})</h2>

            <div style={styles.vendorGrid}>
              {vendors.length === 0 ? (
                <p style={styles.emptyState}>Belum ada vendor</p>
              ) : (
                vendors.map(vendor => (
                  <div key={vendor.id} style={styles.vendorCard}>
                    <h3 style={styles.vendorName}>{vendor.name}</h3>
                    <p><strong>Kategori:</strong> {vendor.category}</p>
                    <p><strong>Harga:</strong> Rp {vendor.price?.toLocaleString('id-ID')}</p>
                    <p><strong>Waktu:</strong> {vendor.eta_hours} jam</p>
                    <p><strong>Rating:</strong> ⭐ {vendor.rating?.toFixed(1) || '0.0'} ({vendor.review_count} review)</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span style={{
                        ...styles.badge,
                        backgroundColor: vendor.is_available ? '#4caf50' : '#ff9800'
                      }}>
                        {vendor.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </p>
                    {vendor.bio && <p><strong>Bio:</strong> {vendor.bio}</p>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon }) {
  return (
    <div style={styles.statCard}>
      <p style={styles.statIcon}>{icon}</p>
      <p style={styles.statLabel}>{label}</p>
      <p style={styles.statValue}>{value}</p>
    </div>
  )
}

function getRoleBadgeStyle(role) {
  let bgColor = '#2196f3'
  if (role === 'admin') bgColor = '#f44336'
  if (role === 'vendor') bgColor = '#ff9800'
  return {
    ...styles.badge,
    backgroundColor: bgColor,
  }
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
    maxWidth: '1200px',
    margin: '0 auto 2rem',
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: '600',
    margin: '0',
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
  tabs: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    maxWidth: '1200px',
    margin: '0 auto 2rem',
  },
  tab: {
    padding: '10px 16px',
    fontSize: '14px',
    fontWeight: '500',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
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
  statIcon: {
    fontSize: '28px',
    margin: '0 0 8px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#888',
    margin: '0 0 8px',
  },
  statValue: {
    fontSize: '22px',
    fontWeight: '600',
    margin: '0',
  },
  card: {
    background: '#fff',
    padding: '2rem',
    borderRadius: '8px',
    border: '0.5px solid #e0e0e0',
    marginBottom: '2rem',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    margin: '0 0 1.5rem',
    borderBottom: '1px solid #eee',
    paddingBottom: '1rem',
  },
  statsDetail: {
    fontSize: '14px',
    lineHeight: '1.8',
    marginBottom: '1.5rem',
  },
  tableContainer: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: '#f5f5f5',
    borderBottom: '1px solid #ddd',
  },
  tableRow: {
    borderBottom: '1px solid #eee',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',

    'thead tr': {
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #ddd',
    },
    'tbody tr': {
      borderBottom: '1px solid #eee',
      '&:hover': {
        backgroundColor: '#fafafa',
      }
    },
    'th, td': {
      padding: '12px',
      textAlign: 'left',
      fontSize: '13px',
    },
    'th': {
      fontWeight: '600',
      color: '#333',
    }
  },
  email: {
    fontSize: '12px',
    color: '#666',
  },
  badge: {
    color: '#fff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    fontWeight: '600',
  },
  vendorGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  vendorCard: {
    background: '#fafafa',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '0.5px solid #e0e0e0',
  },
  vendorName: {
    fontSize: '16px',
    fontWeight: '600',
    margin: '0 0 1rem',
  },
  emptyState: {
    textAlign: 'center',
    color: '#999',
    fontSize: '14px',
    padding: '2rem',
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
    maxWidth: '1200px',
    margin: '0 auto 1.5rem',
  },
}

// Fix table styling – inline styles don't support nested pseudo-selectors
const TableStyles = `
  table { width: 100%; border-collapse: collapse; }
  table thead tr { background: #f5f5f5; border-bottom: 1px solid #ddd; }
  table tbody tr { border-bottom: 1px solid #eee; }
  table tbody tr:hover { background: #fafafa; }
  table th, table td { padding: 12px; text-align: left; font-size: 13px; }
  table th { font-weight: 600; color: #333; }
`
