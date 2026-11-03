import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getJobs, getUserById, getProvider, fmt } from '../../store';
import TopBar from '../../components/TopBar';
import BottomTabs from '../../components/BottomTabs';

export default function Profile() {
  const { user: sessionUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast    = useToast();

  // ONE source for everything: the store record, not the AuthContext
  // snapshot taken at login/signup. The context object goes stale after
  // any store write (wallet holds, etc.), so name/phone/address/avatar
  // previously could disagree with the wallet shown next to them.
  // (Signup collects a phone number but no address field — see
  // Signup.jsx/store.js signup() — so "Address not set" is accurate
  // for self-registered users, not a mapping bug; seeded demo users
  // do carry an address, and that is what shows for them.)
  const user = sessionUser ? (getUserById(sessionUser.id) || sessionUser) : null;
  // getJobs already returns newest-first (createdAt desc), so this list is
  // the customer's service history in the right order without re-sorting.
  const jobs      = user ? getJobs({ customerId: user.id }) : [];
  const completed = jobs.filter(j => j.status === 'completed').length;

  // Same status labels as History.jsx, so both screens read identically.
  const statusConfig = {
    completed:            { badge: 'badge-success', label: 'Completed' },
    quote_rejected:       { badge: 'badge-muted',   label: 'Visiting fee only' },
    cancelled_by_customer:{ badge: 'badge-muted',   label: 'Cancelled' },
    cancelled_by_provider:{ badge: 'badge-muted',   label: 'Cancelled' },
    in_progress:          { badge: 'badge-info',    label: 'In progress' },
    matched:              { badge: 'badge-info',    label: 'Provider assigned' },
    accepted:             { badge: 'badge-info',    label: 'Provider assigned' },
    diagnosing:           { badge: 'badge-info',    label: 'In progress' },
    quote_sent:           { badge: 'badge-info',    label: 'Quote sent' },
    pending:              { badge: 'badge-warning', label: 'Pending' },
  };

  function historyKeyDown(e, jobId) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(`/job/${jobId}`); }
  }
  const wallet    = user?.wallet || { balance: 500, holds: [] };
  const holds     = wallet.holds || [];
  // Avatar fallback: stored initials, else initials from the name.
  const avatarText = user?.avatar
    || user?.name?.trim().split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    || '?';

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
            <div className="avatar avatar-xl">{avatarText}</div>
            <div>
              <h3>{user?.name}</h3>
              <span className="meta">{user?.phone || 'No phone set'}</span>
              <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>
                {user?.address || 'Address not set'}
              </div>
            </div>
          </div>
        </div>

        {/* My details — same fresh store record as the wallet below, so
            these can never disagree with it. Values are shown only when
            stored; unset phone/address are said to be unset, never invented
            (signup collects phone but no address — see the note above). */}
        <p className="section-title">My details</p>
        <div className="prov-card" style={{ marginBottom: 4 }}>
          {[
            { label: 'Name',    value: user?.name },
            { label: 'Phone',   value: user?.phone },
            { label: 'Email',   value: user?.email },
            { label: 'Address', value: user?.address },
          ].map(({ label, value }) => (
            <div key={label} className="line-item" style={{ padding: '8px 0' }}>
              <div className="li-label" style={{ fontSize: 13 }}><strong>{label}</strong></div>
              <div className="li-value" style={{ fontSize: 13, textAlign: 'right', maxWidth: '65%' }}>
                {value || 'Not set'}
              </div>
            </div>
          ))}
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
              <span className="material-symbols-outlined" style={{ color:'var(--blue)', fontSize:20 }}>account_balance_wallet</span>
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

        {/* My service history — newest first, same hist-row styling as
            History.jsx. A job with no provider yet shows that plainly;
            provider names are looked up per job, never assumed. */}
        <p className="section-title">My service history</p>
        {jobs.length === 0 ? (
          <p className="muted" style={{ fontSize: 13, marginBottom: 20 }}>
            No service history yet — book your first repair and it will appear here.
          </p>
        ) : (
          <div style={{ marginBottom: 20 }}>
            {jobs.map(j => {
              const prov = j.providerId ? getProvider(j.providerId) : null;
              const cfg = statusConfig[j.status] || { badge: 'badge-muted', label: j.status };
              const issueShort = j.issue && j.issue.length > 40 ? `${j.issue.slice(0, 40)}…` : (j.issue || '');
              return (
                <div key={j.id} className="hist-row" role="button" tabIndex={0}
                  aria-label={`${j.item} — ${prov?.name || 'provider not assigned yet'} — ${cfg.label}`}
                  onClick={() => navigate(`/job/${j.id}`)}
                  onKeyDown={e => historyKeyDown(e, j.id)}>
                  <div className="avatar">
                    <span className="material-symbols-outlined">build</span>
                  </div>
                  <div className="info">
                    <strong>{j.item}</strong>
                    {issueShort && <span>{issueShort}</span>}
                    <span>
                      {prov?.name || 'Provider not assigned yet'} · {j.date} · ₹{(j.total || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
        )}

        <hr className="divider" />

        <button className="btn btn-outline" onClick={handleLogout}>
          <span className="material-symbols-outlined">logout</span> Log out
        </button>

        <p style={{ textAlign:'center', fontSize:11, color:'var(--text-muted)', marginTop:16 }}>
          FixMate v1.0.0
          {/* Note: the old "Implementation checklist" link pointed at /checklist,
              which has no route in this app, so it was removed rather than
              sending users to a dead link. */}
        </p>
      </div>

      <BottomTabs />
    </div>
  );
}
