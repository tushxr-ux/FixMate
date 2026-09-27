import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJobs, getProvider, CATEGORIES } from '../../store';
import BottomTabs from '../../components/BottomTabs';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const allJobs = user ? getJobs({ customerId: user.id }) : [];
  const activeJob = allJobs.find(j => !['completed', 'cancelled', 'disputed'].includes(j.status));
  const recentJobs = allJobs.slice(0, 4);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return { cls: 'badge-success', label: 'Completed' };
      case 'matching': return { cls: 'badge-info', label: 'Matching...' };
      case 'assigned': return { cls: 'badge-info', label: 'Tech Assigned' };
      case 'arrived': return { cls: 'badge-warning', label: 'Tech Arrived' };
      case 'diagnosing': return { cls: 'badge-warning', label: 'Diagnosing' };
      case 'quote_sent': return { cls: 'badge-warning', label: 'Quote Ready' };
      case 'working': return { cls: 'badge-info', label: 'In Progress' };
      default: return { cls: 'badge-muted', label: status.replace(/_/g, ' ') };
    }
  };

  return (
    <div className="home-desktop-wrapper screen-enter">
      {/* ── Main Content Area (Split on Desktop) ── */}
      <div className="home-desktop-grid">
        {/* Left Column: Greeting, Search, Categories & Services */}
        <div className="home-main-col">
          {/* Greeting Banner */}
          <div className="home-hero-banner">
            <div>
              <h1 className="greeting">
                Welcome back, {user?.name?.split(' ')[0] || 'Friend'} 👋
              </h1>
              <p className="sub">
                Book verified hyperlocal repair technicians or request 24/7 emergency roadside assistance.
              </p>
            </div>
            <div
              onClick={() => navigate('/location-picker')}
              className="location-pill"
              style={{ alignSelf: 'flex-start' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--blue)' }}>location_on</span>
              <span>Bengaluru Central</span>
            </div>
          </div>

          {/* Interactive Search Bar */}
          <div className="search-bar" onClick={() => navigate('/items/electronics')}>
            <span className="material-symbols-outlined" style={{ color: 'var(--blue)', fontSize: 22 }}>search</span>
            <input
              type="text"
              readOnly
              placeholder="Search for AC service, plumber, bike repair, electrician, washing machine..."
              style={{ cursor: 'pointer' }}
            />
            <button
              className="btn btn-primary btn-sm"
              style={{ borderRadius: 8, padding: '6px 14px', fontSize: 13 }}
            >
              Search
            </button>
          </div>

          {/* Category Explorer Title */}
          <div className="section-title">
            <span>Explore Services &amp; Repairs</span>
            <span
              style={{ fontSize: 13, color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => navigate('/items/electronics')}
            >
              View Full Directory &rarr;
            </span>
          </div>

          {/* Category Cards Grid (4 columns on laptop, 2 on mobile) */}
          <div className="cat-grid">
            {CATEGORIES.map(cat => (
              <div key={cat.id} className="card" onClick={() => navigate(`/items/${cat.id}`)}>
                <div className="card-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: 26 }}>{cat.icon}</span>
                </div>
                <h3>{cat.name}</h3>
                <p>{cat.desc}</p>
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Visit: ₹50</span>
                  <span style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 700 }}>Book &rarr;</span>
                </div>
              </div>
            ))}
          </div>

          {/* The FixMate Escrow Guarantee Banner */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid var(--border)',
            borderRadius: 16,
            padding: '20px 24px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            flexWrap: 'wrap'
          }}>
            <div style={{
              width: 50,
              height: 50,
              borderRadius: 12,
              background: '#EFF6FF',
              color: 'var(--blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 30 }}>verified_user</span>
            </div>
            <div style={{ flex: 1, minWidth: 240 }}>
              <strong style={{ fontSize: 15, color: 'var(--text)', display: 'block', marginBottom: 4 }}>
                The FixMate Trust &amp; Escrow Guarantee
              </strong>
              <div style={{ fontSize: 13, color: 'var(--text-body)', lineHeight: 1.5 }}>
                Fixed ₹50 Doorstep Inspection fee · 100% Police &amp; Trade Verified Technicians · 30-Day Service Warranty on all jobs.
              </div>
            </div>
            <button
              onClick={() => window.open('/website#guarantee', '_blank')}
              className="btn btn-outline btn-sm"
              style={{ alignSelf: 'center' }}
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Right Column: Active Job, Roadside SOS, and Recent Bookings */}
        <div className="home-side-col">
          {/* Active Job Card (if in progress) */}
          {activeJob && (
            <div
              onClick={() => {
                if (['matching', 'no_provider'].includes(activeJob.status)) navigate(`/matching/${activeJob.id}`);
                else if (activeJob.status === 'assigned') navigate(`/tracking/${activeJob.id}`);
                else if (['diagnosing', 'quote_sent'].includes(activeJob.status)) navigate(`/quote/${activeJob.id}`);
                else navigate(`/job/${activeJob.id}`);
              }}
              style={{
                background: 'linear-gradient(135deg, #1A56DB 0%, #2563EB 100%)',
                borderRadius: 16,
                padding: '20px',
                color: '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 8px 24px rgba(26, 86, 219, 0.25)',
                marginBottom: 20
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  background: 'rgba(255, 255, 255, 0.2)',
                  padding: '4px 10px',
                  borderRadius: 9999
                }}>
                  Active Service
                </span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 6px', color: '#FFFFFF' }}>{activeJob.item}</h3>
              <p style={{ fontSize: 13, opacity: 0.9, margin: '0 0 16px' }}>Status: {getStatusBadge(activeJob.status).label}</p>
              <button
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  background: '#FFFFFF',
                  color: 'var(--blue)',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                View Live Tracking &amp; Quote
              </button>
            </div>
          )}

          {/* 24/7 Roadside Assistance Card */}
          <div
            onClick={() => navigate('/emergency')}
            style={{
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)',
              border: '1.5px solid #FECACA',
              borderRadius: 16,
              padding: '20px',
              cursor: 'pointer',
              marginBottom: 24,
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.08)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: '#DC2626',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 26 }}>car_crash</span>
              </div>
              <div>
                <strong style={{ fontSize: 16, color: '#991B1B', display: 'block' }}>
                  24/7 Roadside Emergency SOS
                </strong>
                <span style={{ fontSize: 12, color: '#B91C1C' }}>
                  Flat tyre, dead battery, puncture, or towing
                </span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: '#7F1D1D', lineHeight: 1.5, margin: '0 0 14px' }}>
              Stranded on the road? Mobile rescue team dispatched to your GPS location in 15 minutes.
            </p>
            <button
              className="btn btn-danger"
              style={{ padding: '10px 16px', fontSize: 13, width: '100%' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>emergency</span>
              <span>Trigger Roadside SOS</span>
            </button>
          </div>

          {/* Recent Service Bookings List */}
          <div style={{
            background: '#FFFFFF',
            border: '1.5px solid var(--border)',
            borderRadius: 16,
            padding: 20,
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <strong style={{ fontSize: 15, color: 'var(--text)' }}>Recent Bookings</strong>
              {recentJobs.length > 0 && (
                <span
                  style={{ fontSize: 12, color: 'var(--blue)', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => navigate('/history')}
                >
                  View All &rarr;
                </span>
              )}
            </div>

            {recentJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 36, color: 'var(--text-light)', marginBottom: 8 }}>
                  receipt_long
                </span>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>No previous bookings yet.</p>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-light)' }}>
                  Pick a service category to request your first fix.
                </p>
              </div>
            ) : (
              recentJobs.map(j => {
                const prov = getProvider(j.providerId);
                const badge = getStatusBadge(j.status);
                return (
                  <div
                    key={j.id}
                    className="hist-row"
                    onClick={() => navigate(`/job/${j.id}`)}
                    style={{ padding: '12px', marginBottom: 8 }}
                  >
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: 12 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>build</span>
                    </div>
                    <div className="info">
                      <strong style={{ fontSize: 13 }}>{prov?.name || 'Verified Tech'}</strong>
                      <span style={{ fontSize: 11 }}>{j.item} · {j.date}</span>
                    </div>
                    <span className={`badge ${badge.cls}`} style={{ fontSize: 10, padding: '3px 8px' }}>
                      {badge.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Persistent Bottom Tabs ONLY on mobile */}
      <BottomTabs />
    </div>
  );
}
