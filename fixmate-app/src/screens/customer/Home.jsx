import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getJobs, getProvider, CATEGORIES } from '../../store';
import BottomTabs from '../../components/BottomTabs';

export default function Home() {
  const { user }  = useAuth();
  const navigate  = useNavigate();
  const jobs      = user ? getJobs({ customerId: user.id }).slice(0, 2) : [];

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0 }}>
      <div className="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <img src="/fixmate-logo.png" alt="FixMate" style={{ height: 26, width: 'auto', objectFit: 'contain' }} />
        </div>
        <button className="icon-btn" onClick={() => navigate('/history')} aria-label="Service history">
          <span className="material-symbols-outlined">history</span>
        </button>
        <button className="icon-btn" onClick={() => navigate('/profile')} aria-label="Profile">
          <span className="material-symbols-outlined">person</span>
        </button>
      </div>

      <div className="body screen-enter">
        <p className="greeting">Hi {user?.name?.split(' ')[0] || 'there'} 👋</p>
        <p className="sub">What needs fixing today?</p>

        <div className="search-bar" onClick={() => navigate('/items/electronics')}>
          <span className="material-symbols-outlined">search</span>
          <span>Search for AC, plumber, bike…</span>
        </div>

        <p className="section-title">Categories</p>
        <div className="cat-grid">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="card" onClick={() => navigate(`/items/${cat.id}`)}>
              <div className="card-icon">
                <span className="material-symbols-outlined">{cat.icon}</span>
              </div>
              <h3>{cat.name}</h3>
              <p>{cat.desc}</p>
            </div>
          ))}
        </div>

        <p className="section-title">Recent activity</p>
        {jobs.length === 0 ? (
          <p className="muted" style={{ textAlign:'center', padding:'12px 0' }}>No recent jobs yet.</p>
        ) : (
          jobs.map(j => {
            const prov = getProvider(j.providerId);
            return (
              <div key={j.id} className="hist-row" onClick={() => navigate(`/job/${j.id}`)}>
                <div className="avatar">
                  <span className="material-symbols-outlined">build</span>
                </div>
                <div className="info">
                  <strong>{prov?.name || 'Provider'}</strong>
                  <span>{j.item} · {j.date}</span>
                </div>
                <span className={`badge ${j.status === 'completed' ? 'badge-success' : 'badge-muted'}`}>
                  {j.status === 'completed' ? 'Completed' : j.status.replace(/_/g, ' ')}
                </span>
              </div>
            );
          })
        )}
      </div>

      <BottomTabs />
    </div>
  );
}
