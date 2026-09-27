import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getJobs } from '../../store';
import TopBar from '../../components/TopBar';
import BottomTabs from '../../components/BottomTabs';

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();

  const jobs      = user ? getJobs({ customerId: user.id }) : [];
  const completed = jobs.filter(j => j.status === 'completed').length;

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
        <div className="hist-row" style={{ marginBottom:20 }}>
          <div className="avatar">
            <span className="material-symbols-outlined">account_balance_wallet</span>
          </div>
          <div className="info">
            <strong>Wallet balance</strong>
            <span>₹0 held · booking hold appears here <em>(illustrative)</em></span>
          </div>
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
