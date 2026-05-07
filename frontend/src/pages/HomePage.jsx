// src/pages/HomePage.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { vendorAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const CATEGORIES = [
  { value: '', label: 'Semua Kategori' },
  { value: 'cleaning', label: 'Kebersihan' },
  { value: 'electric', label: 'Listrik & AC' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'design', label: 'Desain Interior' },
  { value: 'moving', label: 'Pindahan' },
  { value: 'pest', label: 'Pest Control' },
]

const CAT_ICONS = {
  cleaning: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l18 18M8.56 2.9A7 7 0 0 1 19 9v4"/><path d="M19 9a7 7 0 0 1-7 7H5a3 3 0 0 1-3-3V9a7 7 0 0 1 .9-3.44"/></svg>,
  electric:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  plumbing:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v6m0 0a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0 8v6"/></svg>,
  design:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>,
  moving:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  pest:      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22c4-4 8-7 8-11a8 8 0 0 0-16 0c0 4 4 7 8 11z"/></svg>,
  '':        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
}

const STARS = (n) => '★'.repeat(Math.round(n || 0)) + '☆'.repeat(5 - Math.round(n || 0))

export default function HomePage() {
  const navigate  = useNavigate()
  const { isLoggedIn } = useAuth()
  const [vendors, setVendors]   = useState([])
  const [category, setCategory] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    setIsLoading(true)
    vendorAPI.getAll(category)
      .then(res => setVendors(res.data || []))
      .catch(() => setError('Gagal memuat data vendor'))
      .finally(() => setIsLoading(false))
  }, [category])

  const handleBooking = (vendorId) => {
    if (!isLoggedIn) { navigate('/login'); return }
    navigate(`/booking/${vendorId}`)
  }

  // Calculate dynamic stats based on loaded vendors
  const activeVendorsCount = vendors.length
  const averageRating = vendors.length > 0
    ? (vendors.reduce((acc, v) => acc + (v.rating || 0), 0) / vendors.length).toFixed(1)
    : '0.0'
  const totalReviewsCount = vendors.reduce((acc, v) => acc + (v.review_count || 0), 0)


  return (
    <div style={{minHeight:'100vh', background:'var(--gray-50)'}}>
      <Navbar />

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
        padding: '5rem 2rem 4rem',
        textAlign: 'center',
      }}>
        <div style={{maxWidth:'640px', margin:'0 auto'}}>
          <div style={{
            display:'inline-block', marginBottom:'1.25rem',
            background:'rgba(59,130,246,0.15)', border:'1px solid rgba(59,130,246,0.3)',
            color:'#60a5fa', fontSize:'13px', fontWeight:'600',
            padding:'5px 14px', borderRadius:'999px', letterSpacing:'0.03em',
          }}>
            Platform Jasa Profesional #1
          </div>
          <h1 style={{
            color:'#fff', fontSize:'48px', fontWeight:'800',
            lineHeight:'1.15', letterSpacing:'-0.03em', marginBottom:'1.25rem',
          }}>
            Temukan Vendor<br />
            <span style={{
              background: 'linear-gradient(90deg, #60a5fa, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Terpercaya
            </span>
          </h1>
          <p style={{color:'#94a3b8', fontSize:'17px', lineHeight:'1.7', marginBottom:'2.5rem'}}>
            Ribuan vendor terverifikasi siap membantu kebutuhan rumah dan bisnis Anda — cepat, aman, dan terjamin.
          </p>
          {!isLoggedIn && (
            <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
              <Link to="/register" style={{
                padding:'13px 28px', background:'#3b82f6', color:'#fff',
                borderRadius:'10px', fontWeight:'700', fontSize:'15px',
                boxShadow:'0 4px 20px rgba(59,130,246,0.4)',
              }}>
                Mulai Sekarang
              </Link>
              <Link to="/login" style={{
                padding:'13px 28px', background:'rgba(255,255,255,0.08)', color:'#fff',
                borderRadius:'10px', fontWeight:'600', fontSize:'15px',
                border:'1px solid rgba(255,255,255,0.15)',
              }}>
                Masuk
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        background:'#fff', borderBottom:'1px solid var(--gray-200)',
        padding:'1.5rem 2rem',
      }}>
        <div style={{
          maxWidth:'960px', margin:'0 auto',
          display:'flex', justifyContent:'center',
          gap:'3rem', flexWrap:'wrap',
        }}>
          {[
            {num: isLoading ? '-' : activeVendorsCount, label: 'Vendor Aktif'},
            {num: isLoading ? '-' : totalReviewsCount, label: 'Total Ulasan'},
            {num: isLoading ? '-' : `${averageRating}/5`, label: 'Rating Rata-rata'},
            {num: '24/7', label: 'Dukungan'},
          ].map(s => (
            <div key={s.label} style={{textAlign:'center'}}>
              <div style={{fontSize:'22px', fontWeight:'800', color:'var(--navy)', letterSpacing:'-0.02em'}}>
                {s.num}
              </div>
              <div style={{fontSize:'13px', color:'var(--gray-500)', marginTop:'2px'}}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:'1200px', margin:'0 auto', padding:'3rem 2rem'}}>
        {/* Category filter */}
        <div style={{marginBottom:'2rem'}}>
          <h2 style={{
            fontSize:'22px', fontWeight:'800', color:'var(--navy)',
            letterSpacing:'-0.02em', marginBottom:'1.25rem',
          }}>
            Jelajahi Kategori
          </h2>
          <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '7px',
                  padding: '9px 16px', fontSize: '13px', fontWeight: '600',
                  borderRadius: '10px', cursor: 'pointer',
                  border: category === cat.value ? '1.5px solid var(--blue)' : '1.5px solid var(--gray-200)',
                  background: category === cat.value ? '#eff6ff' : '#fff',
                  color: category === cat.value ? 'var(--blue)' : 'var(--gray-600)',
                  transition: 'all 0.15s',
                  boxShadow: category === cat.value ? '0 0 0 3px rgba(59,130,246,0.1)' : 'none',
                }}
              >
                <span style={{color: category === cat.value ? 'var(--blue)' : 'var(--gray-400)'}}>
                  {CAT_ICONS[cat.value]}
                </span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results header */}
        <div style={{
          display:'flex', justifyContent:'space-between', alignItems:'center',
          marginBottom:'1.5rem',
        }}>
          <h2 style={{fontSize:'18px', fontWeight:'700', color:'var(--navy)', letterSpacing:'-0.01em'}}>
            {isLoading ? 'Memuat vendor...' : `${vendors.length} vendor ditemukan`}
          </h2>
        </div>

        {error && (
          <div className="alert alert-error" style={{marginBottom:'1.5rem'}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        {/* Vendor grid */}
        {!isLoading && !error && vendors.length === 0 && (
          <div style={{textAlign:'center', padding:'5rem 0'}}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gray-300)" strokeWidth="1.5" style={{margin:'0 auto 1rem', display:'block'}}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <p style={{fontSize:'16px', color:'var(--gray-400)', fontWeight:'500'}}>
              Tidak ada vendor untuk kategori ini.
            </p>
          </div>
        )}

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))',
          gap:'1.25rem',
        }}>
          {vendors.map(v => (
            <div key={v.id} style={{
              background:'#fff', borderRadius:'16px',
              border:'1px solid var(--gray-200)',
              padding:'1.5rem',
              boxShadow:'0 1px 3px rgba(0,0,0,0.04)',
              transition:'box-shadow 0.2s, transform 0.2s',
              cursor:'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.10)'
                e.currentTarget.style.transform = 'translateY(-3px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Card header */}
              <div style={{display:'flex', gap:'14px', alignItems:'center', marginBottom:'14px'}}>
                <div style={{
                  width:'50px', height:'50px', borderRadius:'14px',
                  background:'linear-gradient(135deg, #3b82f6, #6366f1)',
                  color:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'17px', fontWeight:'800', flexShrink:0,
                  boxShadow:'0 4px 12px rgba(59,130,246,0.3)',
                }}>
                  {v.name.slice(0,2).toUpperCase()}
                </div>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{
                    fontSize:'16px', fontWeight:'700', color:'var(--navy)',
                    letterSpacing:'-0.01em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis',
                  }}>
                    {v.name}
                  </div>
                  <div style={{
                    display:'inline-flex', alignItems:'center', gap:'4px',
                    marginTop:'3px',
                    background:'var(--gray-100)', borderRadius:'6px',
                    padding:'2px 8px', fontSize:'11px', fontWeight:'600', color:'var(--gray-600)',
                  }}>
                    {v.role || v.category}
                  </div>
                </div>
              </div>

              {/* Tags */}
              {v.tags?.length > 0 && (
                <div style={{display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'12px'}}>
                  {v.tags.map(tag => (
                    <span key={tag} style={{
                      padding:'3px 9px', fontSize:'11px', borderRadius:'6px',
                      background:'#eff6ff', color:'#3b82f6', fontWeight:'600',
                      border:'1px solid #bfdbfe',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating + Price */}
              <div style={{
                display:'flex', justifyContent:'space-between', alignItems:'center',
                marginBottom:'12px', paddingBottom:'12px',
                borderBottom:'1px solid var(--gray-100)',
              }}>
                <div style={{display:'flex', alignItems:'center', gap:'6px'}}>
                  <span style={{color:'#f59e0b', fontSize:'13px', letterSpacing:'0.05em'}}>
                    {STARS(v.rating)}
                  </span>
                  <span style={{fontSize:'13px', color:'var(--gray-500)'}}>
                    {v.rating?.toFixed(1)} ({v.review_count || 0} ulasan)
                  </span>
                </div>
              </div>

              {/* Price + ETA */}
              <div style={{
                display:'flex', justifyContent:'space-between',
                alignItems:'flex-end', marginBottom:'16px',
              }}>
                <div>
                  <div style={{fontSize:'11px', color:'var(--gray-400)', fontWeight:'500', marginBottom:'2px'}}>
                    Mulai dari
                  </div>
                  <div style={{fontSize:'20px', fontWeight:'800', color:'var(--navy)', letterSpacing:'-0.02em'}}>
                    Rp {v.price?.toLocaleString('id-ID')}
                  </div>
                </div>
                <div style={{
                  display:'flex', alignItems:'center', gap:'5px',
                  fontSize:'12px', color:'var(--green)', fontWeight:'600',
                  background:'#f0fdf4', padding:'5px 10px', borderRadius:'8px',
                  border:'1px solid #bbf7d0',
                }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {v.eta_hours < 24
                    ? `${v.eta_hours} jam`
                    : `${Math.round(v.eta_hours/24)} hari`}
                </div>
              </div>

              {/* CTA */}
              <button
                onClick={() => handleBooking(v.id)}
                style={{
                  width:'100%', padding:'12px', fontSize:'14px', fontWeight:'700',
                  background:'var(--navy)', color:'#fff', border:'none',
                  borderRadius:'10px', cursor:'pointer', letterSpacing:'-0.01em',
                  transition:'background 0.15s, transform 0.1s',
                  boxShadow:'0 2px 8px rgba(15,23,42,0.2)',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--navy)'}
              >
                Booking Sekarang
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}