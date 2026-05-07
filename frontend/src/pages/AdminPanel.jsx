// src/pages/AdminPanel.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { adminAPI } from '../api/client'
import Navbar from '../components/Navbar'

export default function AdminPanel() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [dashboard, setDashboard] = useState(null)
  const [users, setUsers] = useState([])
  const [vendors, setVendors] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role !== 'admin') { navigate('/login'); return }
    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setIsLoading(true); setError('')
      const [dashRes, usersRes, vendorsRes] = await Promise.all([
        adminAPI.getDashboard(), adminAPI.getAllUsers(), adminAPI.getAllVendors(),
      ])
      if (dashRes.success) setDashboard(dashRes.data)
      if (usersRes.success) setUsers(usersRes.data || [])
      if (vendorsRes.success) setVendors(vendorsRes.data || [])
    } catch (err) { setError(err.message) }
    finally { setIsLoading(false) }
  }

  if (isLoading) {
    return (
      <div className="page-shell">
        <Navbar />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
          <div className="spinner" />
          <span className="loading-text">Memuat Data Admin...</span>
        </div>
      </div>
    )
  }

  const totalCustomers = users.filter(u => u.role === 'customer').length
  const totalAdmins    = users.filter(u => u.role === 'admin').length

  const TABS = [
    { id: 'dashboard', label: 'Overview', count: null },
    { id: 'users',     label: 'Users',    count: users.length },
    { id: 'vendors',   label: 'Vendors',  count: vendors.length },
  ]

  return (
    <div className="page-shell">
      <Navbar />
      <div className="page-container">

        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="page-badge">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="4" r="4"/></svg>
            Admin Panel
          </div>
          <h1 className="page-title">Control Panel</h1>
          <p className="page-subtitle">Kelola sistem, pengguna, dan performa platform secara real-time.</p>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>}

        {/* Tabs */}
        <div className="tab-bar">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`tab-btn${activeTab === tab.id ? ' active' : ''}`}>
              {tab.label}
              {tab.count !== null && <span className="tab-count">{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboard && (
          <div style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="admin-stats">
              {[
                { label: 'Total Users',    value: dashboard.total_users,    bg: 'linear-gradient(135deg,#3b82f6,#60a5fa)' },
                { label: 'Total Vendors',  value: dashboard.total_vendors,  bg: 'linear-gradient(135deg,#8b5cf6,#a78bfa)' },
                { label: 'Total Bookings', value: dashboard.total_bookings, bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)' },
                { label: 'Total Revenue',  value: `Rp ${(dashboard.total_revenue||0).toLocaleString('id-ID')}`, bg: 'linear-gradient(135deg,#10b981,#34d399)' },
              ].map(s => (
                <div key={s.label} className="admin-stat-card">
                  <div className="admin-stat-icon" style={{ background: s.bg }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="10"/></svg>
                  </div>
                  <div>
                    <div className="admin-stat-label">{s.label}</div>
                    <div className="admin-stat-value">{s.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-grid">
              <div className="summary-card">
                <div className="summary-card-title">Status Booking</div>
                {[
                  { label: 'Pending',   value: dashboard.pending_bookings,   c: '#b45309', bg: '#fffbeb', bd: '#fde68a' },
                  { label: 'Accepted',  value: dashboard.accepted_bookings,  c: '#1d4ed8', bg: '#eff6ff', bd: '#bfdbfe' },
                  { label: 'Completed', value: dashboard.completed_bookings, c: '#15803d', bg: '#f0fdf4', bd: '#bbf7d0' },
                ].map(r => (
                  <div key={r.label} className="summary-row" style={{ background: r.bg, border: `1px solid ${r.bd}` }}>
                    <span className="summary-row-label" style={{ color: r.c }}>{r.label}</span>
                    <span className="summary-row-value" style={{ color: r.c }}>{r.value}</span>
                  </div>
                ))}
              </div>

              <div className="summary-card">
                <div className="summary-card-title">Performa Platform</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '48px', fontWeight: '900', color: 'var(--navy)', lineHeight: 1, letterSpacing: '-0.04em' }}>
                    {(dashboard.average_rating || 0).toFixed(1)}
                  </div>
                  <div>
                    <div style={{ color: '#f59e0b', fontSize: '20px', marginBottom: '6px' }}>
                      {'★'.repeat(Math.round(dashboard.average_rating || 0))}{'☆'.repeat(5 - Math.round(dashboard.average_rating || 0))}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '600' }}>Rata-rata Rating Vendor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="user-chips">
              {[
                { label: 'Customers', count: totalCustomers,  color: '#3b82f6' },
                { label: 'Vendors',   count: vendors.length,  color: '#8b5cf6' },
                { label: 'Admins',    count: totalAdmins,     color: '#ef4444' },
              ].map(c => (
                <div key={c.label} className="user-chip">
                  <div className="user-chip-dot" style={{ background: c.color }} />
                  {c.label}
                  <span className="user-chip-count">{c.count}</span>
                </div>
              ))}
            </div>

            <div className="panel-card">
              <div className="panel-card-header">
                <span className="panel-card-title">Daftar Pengguna</span>
                <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>{users.length} pengguna terdaftar</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead><tr>
                    <th>#</th><th>Nama Pengguna</th><th>Role</th><th>Status</th><th>Tanggal Daftar</th>
                  </tr></thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr key={u.id}>
                        <td className="td-num">#{idx + 1}</td>
                        <td>
                          <div className="td-user-name">{u.name}</div>
                          <div className="td-user-email">{u.email}</div>
                        </td>
                        <td><RoleBadge role={u.role} /></td>
                        <td>
                          <span className="status-badge" style={{
                            color: u.is_active ? '#15803d' : '#b91c1c',
                            background: u.is_active ? '#f0fdf4' : '#fef2f2',
                            border: `1px solid ${u.is_active ? '#bbf7d0' : '#fecaca'}`
                          }}>{u.is_active ? 'Active' : 'Inactive'}</span>
                        </td>
                        <td className="td-date">{new Date(u.created_at).toLocaleDateString('id-ID')}</td>
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
          <div style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="vendor-grid">
              {vendors.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
                  <p className="empty-state-title">Belum ada vendor terdaftar.</p>
                </div>
              ) : vendors.map(v => (
                <div key={v.id} className="vendor-card">
                  <div className="vendor-card-header">
                    <div className="vendor-avatar" style={{ background: 'linear-gradient(135deg,#0f172a,#1e3a5f)' }}>
                      {v.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="vendor-card-name">{v.name}</div>
                      <span className="vendor-card-cat">{v.category}</span>
                    </div>
                  </div>
                  <div className="vendor-card-stats">
                    <div>
                      <div className="vendor-card-stat-label">Harga Mulai</div>
                      <div className="vendor-card-stat-value">Rp {v.price?.toLocaleString('id-ID')}</div>
                    </div>
                    <div>
                      <div className="vendor-card-stat-label">Estimasi</div>
                      <div className="vendor-card-stat-value">{v.eta_hours} Jam</div>
                    </div>
                  </div>
                  <div className="vendor-card-footer">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: '#f59e0b', fontSize: '13px' }}>
                        {'★'.repeat(Math.round(v.rating || 0))}{'☆'.repeat(5 - Math.round(v.rating || 0))}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>({v.review_count || 0})</span>
                    </div>
                    <span className="status-badge" style={{
                      color: v.is_available ? '#15803d' : '#b45309',
                      background: v.is_available ? '#f0fdf4' : '#fffbeb',
                      border: `1px solid ${v.is_available ? '#bbf7d0' : '#fde68a'}`
                    }}>{v.is_available ? 'Available' : 'Busy'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function RoleBadge({ role }) {
  const map = {
    admin:    { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
    vendor:   { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
    customer: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  }
  const s = map[role] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }
  return (
    <span className="status-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
      {role}
    </span>
  )
}
