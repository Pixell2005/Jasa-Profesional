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
    return (
      <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
        <Navbar />
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--gray-500)' }}>
          Memuat Data Admin...
        </div>
      </div>
    )
  }

  const totalCustomers = users.filter(u => u.role === 'customer').length
  const totalAdmins = users.filter(u => u.role === 'admin').length

  const TABS = [
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'vendors', label: 'Vendors', icon: '💼' }
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gray-50)' }}>
      <Navbar />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '800', color: 'var(--navy)', letterSpacing: '-0.03em', marginBottom: '4px' }}>
              Admin Control Panel
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '14px' }}>
              Kelola sistem, pengguna, dan performa platform
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            {error}
          </div>
        )}

        {/* Tabs */}
        <div style={{ 
          display: 'flex', gap: '8px', marginBottom: '2.5rem', 
          borderBottom: '1px solid var(--gray-200)', paddingBottom: '1rem' 
        }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', fontSize: '14px', fontWeight: '600',
                borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                border: activeTab === tab.id ? 'none' : '1px solid transparent',
                background: activeTab === tab.id ? 'var(--navy)' : 'transparent',
                color: activeTab === tab.id ? '#fff' : 'var(--gray-600)',
                boxShadow: activeTab === tab.id ? '0 4px 12px rgba(15,23,42,0.15)' : 'none',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && dashboard && (
          <div style={{ animation: 'slideUp 0.3s ease-out' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--navy)', marginBottom: '1.5rem' }}>Statistik Utama</h2>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem'
            }}>
              <StatCard label="Total Users" value={dashboard.total_users} icon="👥" bg="linear-gradient(135deg, #3b82f6, #60a5fa)" />
              <StatCard label="Total Vendors" value={dashboard.total_vendors} icon="💼" bg="linear-gradient(135deg, #8b5cf6, #a78bfa)" />
              <StatCard label="Total Bookings" value={dashboard.total_bookings} icon="📋" bg="linear-gradient(135deg, #f59e0b, #fbbf24)" />
              <StatCard label="Total Revenue" value={`Rp ${(dashboard.total_revenue || 0).toLocaleString('id-ID')}`} icon="💰" bg="linear-gradient(135deg, #10b981, #34d399)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--gray-200)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-600)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status Booking
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#fffbeb', borderRadius: '10px', border: '1px solid #fde68a' }}>
                    <span style={{ color: '#b45309', fontWeight: '600', fontSize: '14px' }}>Pending</span>
                    <span style={{ color: '#b45309', fontWeight: '800', fontSize: '16px' }}>{dashboard.pending_bookings}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
                    <span style={{ color: '#1d4ed8', fontWeight: '600', fontSize: '14px' }}>Accepted</span>
                    <span style={{ color: '#1d4ed8', fontWeight: '800', fontSize: '16px' }}>{dashboard.accepted_bookings}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                    <span style={{ color: '#15803d', fontWeight: '600', fontSize: '14px' }}>Completed</span>
                    <span style={{ color: '#15803d', fontWeight: '800', fontSize: '16px' }}>{dashboard.completed_bookings}</span>
                  </div>
                </div>
              </div>
              <div style={{ background: '#fff', borderRadius: '16px', padding: '1.75rem', border: '1px solid var(--gray-200)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--gray-600)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Performa Sistem
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', background: 'var(--gray-50)', borderRadius: '12px', border: '1px solid var(--gray-200)' }}>
                  <div style={{ fontSize: '42px', fontWeight: '800', color: 'var(--navy)', lineHeight: 1 }}>
                    {(dashboard.average_rating || 0).toFixed(1)}
                  </div>
                  <div>
                    <div style={{ color: '#f59e0b', fontSize: '18px', marginBottom: '4px', letterSpacing: '0.1em' }}>
                      {'★'.repeat(Math.round(dashboard.average_rating || 0))}
                      {'☆'.repeat(5 - Math.round(dashboard.average_rating || 0))}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)', fontWeight: '500' }}>Rata-rata Rating Vendor</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#fff', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--gray-200)', fontSize: '14px', fontWeight: '600' }}>
                👤 Customers: <span style={{ color: 'var(--navy)', fontWeight: '800', marginLeft: '6px' }}>{totalCustomers}</span>
              </div>
              <div style={{ background: '#fff', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--gray-200)', fontSize: '14px', fontWeight: '600' }}>
                💼 Vendors: <span style={{ color: 'var(--navy)', fontWeight: '800', marginLeft: '6px' }}>{vendors.length}</span>
              </div>
              <div style={{ background: '#fff', padding: '12px 20px', borderRadius: '10px', border: '1px solid var(--gray-200)', fontSize: '14px', fontWeight: '600' }}>
                🔧 Admins: <span style={{ color: 'var(--navy)', fontWeight: '800', marginLeft: '6px' }}>{totalAdmins}</span>
              </div>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid var(--gray-200)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--gray-50)', borderBottom: '1px solid var(--gray-200)' }}>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ID / No</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nama Pengguna</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                      <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: '700', color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tanggal Daftar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, idx) => (
                      <tr key={u.id} style={{ borderBottom: '1px solid var(--gray-100)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--gray-500)' }}>#{idx + 1}</td>
                        <td style={{ padding: '16px 24px' }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)' }}>{u.name}</div>
                          <div style={{ fontSize: '12px', color: 'var(--gray-400)' }}>{u.email}</div>
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <RoleBadge role={u.role} />
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: u.is_active ? '#15803d' : '#b91c1c', background: u.is_active ? '#f0fdf4' : '#fef2f2', border: `1px solid ${u.is_active ? '#bbf7d0' : '#fecaca'}` }}>
                            {u.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '13px', color: 'var(--gray-500)' }}>
                          {new Date(u.created_at).toLocaleDateString('id-ID')}
                        </td>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {vendors.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 0', color: 'var(--gray-400)' }}>Belum ada vendor terdaftar.</div>
              ) : (
                vendors.map(v => (
                  <div key={v.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', border: '1px solid var(--gray-200)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--navy)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800' }}>
                        {v.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--navy)', margin: 0 }}>{v.name}</h3>
                        <div style={{ fontSize: '12px', color: 'var(--blue)', fontWeight: '600', marginTop: '2px', background: '#eff6ff', display: 'inline-block', padding: '2px 8px', borderRadius: '4px' }}>
                          {v.category}
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '1rem', padding: '12px', background: 'var(--gray-50)', borderRadius: '8px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Harga Mulai</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy)' }}>Rp {v.price?.toLocaleString('id-ID')}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Estimasi</div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy)' }}>{v.eta_hours} Jam</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid var(--gray-100)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#f59e0b', fontSize: '14px' }}>{'★'.repeat(Math.round(v.rating || 0))}{'☆'.repeat(5 - Math.round(v.rating || 0))}</span>
                        <span style={{ fontSize: '12px', color: 'var(--gray-500)', fontWeight: '500' }}>({v.review_count || 0})</span>
                      </div>
                      <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', color: v.is_available ? '#15803d' : '#b45309', background: v.is_available ? '#f0fdf4' : '#fffbeb', border: `1px solid ${v.is_available ? '#bbf7d0' : '#fde68a'}` }}>
                        {v.is_available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, bg }) {
  return (
    <div style={{ 
      background: '#fff', padding: '1.5rem', borderRadius: '16px', 
      border: '1px solid var(--gray-200)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
      display: 'flex', alignItems: 'center', gap: '16px', transition: 'transform 0.2s, box-shadow 0.2s'
    }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)' }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.03)' }}>
      <div style={{ 
        width: '54px', height: '54px', borderRadius: '14px', background: bg, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--gray-400)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          {label}
        </div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--navy)', letterSpacing: '-0.02em', lineHeight: 1 }}>
          {value}
        </div>
      </div>
    </div>
  )
}

function RoleBadge({ role }) {
  let styles = { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' }
  if (role === 'admin') styles = { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' }
  if (role === 'vendor') styles = { bg: '#fffbeb', color: '#b45309', border: '#fde68a' }
  if (role === 'customer') styles = { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }

  return (
    <span style={{ 
      display: 'inline-block', padding: '4px 10px', borderRadius: '6px', 
      fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em',
      background: styles.bg, color: styles.color, border: `1px solid ${styles.border}`
    }}>
      {role}
    </span>
  )
}
