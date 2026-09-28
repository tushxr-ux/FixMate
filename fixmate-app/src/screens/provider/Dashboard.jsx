import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getJobs, getProviderByUser, saveProvider, saveJob, fmt, addNotif } from '../../store';
import EmptyState from '../../components/EmptyState';

export default function ProviderDashboard() {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();
  const prov      = user ? getProviderByUser(user.id) : null;
  const [avail, setAvail] = useState(prov?.available ?? false);
  const [radius, setRadius] = useState(prov?.serviceRadius || 5);
  const [showSettings, setShowSettings] = useState(false);

  const myJobs = prov ? getJobs({ providerId: prov.id }) : [];
  const incoming = myJobs.filter(j => j.status === 'matched');
  const active   = myJobs.filter(j => ['accepted', 'diagnosing', 'quote_sent', 'in_progress'].includes(j.status));
  const done     = myJobs.filter(j => j.status === 'completed');
  const earnings = done.reduce((s, j) => s + (j.total || 0), 0);

  function toggleAvail(checked) {
    if (!prov) return;
    const updated = { ...prov, available: checked };
    saveProvider(updated);
    setAvail(checked);
    toast(checked ? 'You are now available for jobs.' : 'You are now offline.', checked ? 'ok' : '');
  }

  function handleSaveRadius(val) {
    const num = Number(val);
    setRadius(num);
    if (!prov) return;
    saveProvider({ ...prov, serviceRadius: num });
    toast.info(`Service radius set to ${num} km`);
  }

  function handleDocUpload(e, type) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target?.result || '';
      if (type === 'id') {
        setIdDoc(dataUrl);
        saveProvider({ ...prov, idVerified: true, idDocUrl: dataUrl });
        toast.success('Identity document uploaded and verified.');
      } else {
        setBizDoc(dataUrl);
        saveProvider({ ...prov, bizVerified: true, bizDocUrl: dataUrl });
        toast.success('Trade/Business document uploaded and verified.');
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAcceptJob(job) {
    const updated = { ...job, status: 'accepted' };
    saveJob(updated);
    if (job.customerId) {
      addNotif(job.customerId, {
        title: 'Specialist En Route',
        text: `${prov?.name || 'Your provider'} accepted your job and is on their way!`,
      });
    }
    toast.success('Job accepted! Customer notified.');
    navigate(`/provider/job/${job.id}`);
  }

  function handleDeclineJob(job) {
    const updated = { ...job, providerId: null, status: 'pending' };
    saveJob(updated);
    toast.info('Job declined.');
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div className="topbar">
        <h2>Provider Dashboard</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          <button 
            className="icon-btn" 
            onClick={() => setShowSettings(!showSettings)} 
            aria-label="Settings"
            title="Service settings & verification"
          >
            <span className="material-symbols-outlined">{showSettings ? 'close' : 'tune'}</span>
          </button>
          <button className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>

      <div className="body screen-enter" style={{ paddingBottom: 32 }}>
        {/* Provider identity */}
        <div className="prov-card" style={{ marginBottom: 14 }}>
          <div className="prov-top">
            <div className="avatar avatar-lg">{prov?.init || user?.avatar || 'PR'}</div>
            <div>
              <h3>{prov?.name || user?.name}</h3>
              <span className="meta">{user?.email}</span>
              {prov?.rating ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 13, color: '#D97706', fontWeight: 600 }}>
                  <span>★ {prov.rating}</span>
                  <span style={{ color: 'var(--gray)', fontWeight: 400 }}>({prov.totalJobs} completed jobs)</span>
                </div>
              ) : null}
            </div>
          </div>
          <div className="verify-strip" style={{ marginTop: 12 }}>
            {[
              { label: 'ID Verified',       ok: prov?.idVerified,  icon: 'verified_user' },
              { label: 'Biz Verified',      ok: prov?.bizVerified, icon: 'business_center' },
              { label: 'FixMate Verified',  ok: prov?.verified,    icon: 'verified' },
            ].map(v => (
              <div key={v.label} className={`verify-chip ${v.ok ? 'yes' : 'no'}`}>
                <span className="material-symbols-outlined">{v.ok ? v.icon : 'pending'}</span>
                {v.ok ? v.label : v.label + ' (Pending)'}
              </div>
            ))}
          </div>
          {/* §6.2: new provider visibility cap notice */}
          {prov?.newProvider && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: '#FEF3C7', borderRadius: 6, fontSize: 12, color: '#92400E', borderLeft: '3px solid #D97706' }}>
              <strong>New Provider Mode</strong> — visible within {prov.visibilityCap || 3} km radius.{' '}
              Complete {Math.max(0, 5 - (prov.totalJobs || 0))} more job(s) &amp; maintain ≥4.0 rating to unlock full {5} km radius.
            </div>
          )}
        </div>

        {/* Availability toggle */}
        <div className="switch-row" style={{ marginBottom: 14 }}>
          <div className="sw-info">
            <strong>Available for jobs</strong>
            <span>{avail ? 'Visible to nearby customers' : 'You are currently offline'}</span>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={avail} onChange={e => toggleAvail(e.target.checked)} />
            <span className="toggle-track" />
          </label>
        </div>

        {/* Settings Drawer / Section */}
        {showSettings && (
          <div className="prov-card" style={{ marginBottom: 16, background: '#F8FAFC', border: '1px solid var(--border)' }}>
            <p className="section-title" style={{ margin: '0 0 10px', fontSize: 13 }}>Provider Configuration</p>
            
            {/* Service radius slider */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>Service Radius</span>
                <strong>{radius} km</strong>
              </div>
              <input 
                type="range" 
                min="1" 
                max="25" 
                value={radius} 
                onChange={e => handleSaveRadius(e.target.value)}
                style={{ width: '100%', accentColor: 'var(--blue)' }}
              />
              <span className="muted" style={{ fontSize: 11 }}>Only matched with jobs within {radius} km</span>
            </div>

            {/* Document verification uploads */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
              <strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Verification Documents</strong>
              <div style={{ display: 'flex', gap: 10 }}>
                <label className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', fontSize: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>badge</span>
                  {prov?.idVerified ? 'ID Uploaded ✓' : 'Upload ID'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleDocUpload(e, 'id')} />
                </label>
                <label className="btn btn-outline btn-sm" style={{ flex: 1, textAlign: 'center', cursor: 'pointer', fontSize: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, verticalAlign: 'middle', marginRight: 4 }}>receipt</span>
                  {prov?.bizVerified ? 'License Uploaded ✓' : 'Trade License'}
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleDocUpload(e, 'biz')} />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="stat-row" style={{ marginBottom: 16 }}>
          <div className="stat-card"><div className="val">{incoming.length}</div><div className="lbl">Incoming</div></div>
          <div className="stat-card"><div className="val">{active.length}</div><div className="lbl">Active</div></div>
          <div className="stat-card"><div className="val" style={{ fontSize: 14 }}>{fmt(earnings)}</div><div className="lbl">Earned</div></div>
        </div>

        {/* ⚡ Incoming Job Requests */}
        {incoming.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span className="material-symbols-outlined" style={{ color: '#D97706', fontSize: 20 }}>bolt</span>
              <p className="section-title" style={{ margin: 0, color: '#D97706' }}>Incoming Job Requests ({incoming.length})</p>
            </div>
            {incoming.map(j => (
              <div key={j.id} className="prov-card" style={{ border: '2px solid var(--blue)', marginBottom: 10, background: '#F8FAFC' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 15 }}>{j.item} — {j.category}</strong>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>{j.issue}</span>
                  </div>
                  <span className="badge badge-info" style={{ fontWeight: 700 }}>{fmt(j.visitingFee || 50)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)', marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--blue)' }}>location_on</span>
                  <span>{j.location?.address || 'Andheri West, Mumbai'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button 
                    className="btn btn-outline btn-sm" 
                    style={{ flex: 1, borderColor: 'var(--red)', color: 'var(--red)' }}
                    onClick={() => handleDeclineJob(j)}
                  >
                    Decline
                  </button>
                  <button 
                    className="btn btn-primary btn-sm" 
                    style={{ flex: 2 }}
                    onClick={() => handleAcceptJob(j)}
                  >
                    Accept Job
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Active jobs in progress */}
        <p className="section-title">Active In-Progress Jobs</p>
        {active.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No active jobs"
            body="When you accept incoming jobs or customers request you, they appear here."
          />
        ) : (
          active.map(j => (
            <div key={j.id} className="hist-row" onClick={() => navigate(`/provider/job/${j.id}`)}>
              <div className="avatar" style={{ background: 'var(--blue-50)', color: 'var(--blue)' }}>
                <span className="material-symbols-outlined">handyman</span>
              </div>
              <div className="info">
                <strong>{j.item} — {j.category}</strong>
                <span>{j.issue.slice(0, 50)}{j.issue.length > 50 ? '…' : ''}</span>
              </div>
              <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>
                {j.status.replace('_', ' ')}
              </span>
            </div>
          ))
        )}

        {/* Completed Jobs */}
        {done.length > 0 && (
          <>
            <p className="section-title" style={{ marginTop: 20 }}>Recent Completed Jobs ({done.length})</p>
            {done.slice(0, 4).map(j => (
              <div key={j.id} className="hist-row" onClick={() => navigate(`/provider/job/${j.id}`)}>
                <div className="avatar" style={{ background: 'var(--green-bg, #DCFCE7)', color: 'var(--green, #16A34A)' }}>
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <div className="info">
                  <strong>{j.item}</strong>
                  <span>{j.date} · {fmt(j.total)}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="badge badge-success">Done</span>
                  {j.rating > 0 && (
                    <div style={{ fontSize: 11, color: '#D97706', marginTop: 2, fontWeight: 600 }}>
                      ★ {j.rating}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
