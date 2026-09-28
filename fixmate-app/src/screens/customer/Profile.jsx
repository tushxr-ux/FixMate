import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getJobs, getUserById, fmt } from '../../store';
import TopBar from '../../components/TopBar';
import BottomTabs from '../../components/BottomTabs';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();

  const jobs      = user ? getJobs({ customerId: user.id }) : [];
  const completed = jobs.filter(j => j.status === 'completed').length;
  // Always read fresh user for wallet state
  const freshUser = user ? (getUserById(user.id) || user) : user;
  const wallet    = freshUser?.wallet || { balance: 500, holds: [] };
  const holds     = wallet.holds || [];

  function handleLogout() {
    logout();
    toast('Logged out.', '');
    navigate('/login');
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1, minHeight:0 }}>
      <TopBar title="Profile" back={false} />

      <div className="body screen-enter">
        <div className="prov-card">
          <div className="prov-top">
            <div className="avatar avatar-xl">{user?.avatar}</div>
            <div>
              <h3>{user?.name}</h3>
              <span className="meta">{user?.phone || 'No phone set'}</span>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                {user?.address || 'Address not set'}
              </div>
            </div>
          </div>
        </div>

        <p className="section-title">Activity</p>
        <div className="stat-row" style={{ gridTemplateColumns:'1fr 1fr', marginBottom:20 }}>
          <div className="stat-card">
            <div className="val">{jobs.length}</div>
            <div className="lbl">Total jobs</div>
          </div>
          <div className="stat-card">
            <div className="val" style={{ color:'var(--green)' }}>{completed}</div>
            <div className="lbl">Completed</div>
          </div>
        </div>

        <p className="section-title">Wallet</p>
        <div className="prov-card" style={{ marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: holds.length ? 12 : 0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span className="material-symbols-outlined" style={{ color:'var(--blue)', fontSize:22 }}>account_balance_wallet</span>
              <div>
                <strong style={{ fontSize:15 }}>{fmt(wallet.balance)}</strong>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>Available balance</div>
              </div>
            </div>
            {holds.length > 0 && (
              <span style={{ fontSize:12, color:'#D97706', fontWeight:600 }}>
                {fmt(holds.reduce((s,h) => s + h.amount, 0))} on hold
              </span>
            )}
          </div>
          {holds.map((h, i) => (
            <div key={i} style={{ padding:'8px 0', borderTop:'1px solid var(--border)', fontSize:12, display:'flex', justifyContent:'space-between', color:'#92400E' }}>
              <span>Hold for job #{h.jobId.slice(-6)} — scheduled booking</span>
              <strong>{fmt(h.amount)}</strong>
            </div>
          ))}
          {holds.length === 0 && (
            <div style={{ fontSize:12, color:'var(--text-muted)' }}>No active holds · holds appear for scheduled bookings</div>
          )}
        </div>

        <hr className="divider" />

        <button className="btn btn-outline" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span> Log out
        </button>

        <p style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:16 }}>
          FixMate v1.0.0 · <a href="/checklist" style={{ color:'var(--blue)' }}>Implementation checklist</a>
        </p>
      </div>

      <BottomTabs />
    </div>
  );
}
