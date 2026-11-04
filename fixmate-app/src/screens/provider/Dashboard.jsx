import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getJobs, getProviderByUser, getProviders, getUserById, saveProvider, saveJob, fmt, addNotif, generateVisitOtp, providerServesCategory } from '../../store';
import EmptyState from '../../components/EmptyState';
import IncomingRequestPopup from '../../components/IncomingRequestPopup';

export default function ProviderDashboard() {
  const { user, logout, login } = useAuth();
  const navigate  = useNavigate();
  const toast     = useToast();
  const prov      = user ? getProviderByUser(user.id) : null;
  const [avail, setAvail] = useState(prov?.available ?? false);
  const [radius, setRadius] = useState(prov?.serviceRadius || 5);
  const [showSettings, setShowSettings] = useState(false);
  // Popup queue state: ids the provider closed with X (neither accepted
  // nor declined). They stay in the lists below and can be opened from
  // there; the popup only shows jobs not dismissed in this session.
  const [dismissed, setDismissed] = useState([]);
  const [, forceUpdate] = useState(0);
  // Doc-upload previews (Nov 2026 QA: setIdDoc/setBizDoc were called
  // but never declared, so uploading a document threw at runtime).
  const [, setIdDoc] = useState(prov?.idDocUrl || '');
  const [, setBizDoc] = useState(prov?.bizDocUrl || '');

  const myJobs = prov ? getJobs({ providerId: prov.id }) : [];
  const incoming = myJobs.filter(j => j.status === 'matched');
  const active   = myJobs.filter(j => ['accepted', 'diagnosing', 'quote_sent', 'in_progress'].includes(j.status));
  const done     = myJobs.filter(j => j.status === 'completed');
  const earnings = done.reduce((s, j) => s + (j.total || 0), 0);

  // Open requests: jobs nobody owns yet (e.g. after a provider
  // declines, the job returns to 'pending' with no provider). Before
  // this section existed, such jobs were invisible to every provider
  // and could never be accepted again. Only jobs in this provider's
  // own categories are shown, and only while the provider is available.
  const openRequests = prov && avail
    ? getJobs({ status: 'pending' }).filter(j => !j.providerId && providerServesCategory(prov, j.category))
    : [];

  // Rapido/Uber-style popup queue: matched (incoming) jobs first, then
  // open requests. Shown only while available, one at a time, with the
  // full count so the provider knows more are waiting.
  const popupQueue = avail
    ? [
        ...incoming.map(j => ({ job: j, open: false })),
        ...openRequests.map(j => ({ job: j, open: true })),
      ].filter(e => !dismissed.includes(e.job.id))
    : [];
  const popupEntry = popupQueue[0] || null;

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
    forceUpdate(n => n + 1);
  }

  // Popup actions reuse the exact end states above. Declining an open
  // (unassigned) request needs no save: the job was never this
  // provider's, so it simply stays pending for other providers.
  function handlePopupAccept() {
    if (!popupEntry) return;
    if (popupEntry.open) handleAcceptOpenJob(popupEntry.job);
    else handleAcceptJob(popupEntry.job);
  }
  function handlePopupDecline() {
    if (!popupEntry) return;
    if (!popupEntry.open) handleDeclineJob(popupEntry.job);
    else toast.info('Request skipped — it stays open for other providers.');
    setDismissed(d => [...d, popupEntry.job.id]);
    forceUpdate(n => n + 1);
  }

  // Accept an open (unassigned) request in one tap. End state matches
  // the normal matched → accepted flow, including the visit OTP: the
  // OTP is generated here explicitly (saveJob only auto-generates it
  // at 'matched'), so the customer sees the same code on their
  // ProviderAssigned/Tracking/JobDetail screens and the provider's
  // arrival gate works exactly as for auto-matched jobs.
  function handleAcceptOpenJob(job) {
    const updated = {
      ...job, providerId: prov.id, status: 'accepted',
      otp: generateVisitOtp(), otpVerified: false,
    };
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

        {/* Provider switcher (demo): open any provider's profile + jobs */}
        <div style={{ marginBottom: 18 }}>
          <p className="section-title" style={{ margin: '0 0 4px' }}>Provider badlo (Demo) — sabka profile kholo</p>
          <p className="muted" style={{ fontSize: 12, margin: '0 0 8px' }}>
            Kisi provider par tap karo — uska dashboard, uski jobs aur uska OTP gate khul jayega.
            Job jis provider ko mili hai, usi ko chuno (active jobs wala badge dekho).
          </p>
          {incoming.length === 0 && active.length === 0 && (
            <p style={{ fontSize: 12, color: '#92400E', background: '#FEF3C7', borderRadius: 6, padding: '8px 10px', margin: '0 0 8px' }}>
              Tumhare paas abhi koi incoming/active job nahi hai — neeche se wo provider chuno jisko job mili hai.
            </p>
          )}
          {getProviders().map(p => {
            const liveJobs = getJobs({ providerId: p.id }).filter(j =>
              ['matched', 'accepted', 'diagnosing', 'quote_sent', 'in_progress'].includes(j.status));
            const isCurrent = prov?.id === p.id;
            const linkedUser = getUserById(p.userId);
            return (
              <div key={p.id} className="prov-card" style={{ marginBottom: 8, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div className="avatar" style={{ flexShrink: 0 }}>{p.init}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ fontSize: 14, display: 'block', overflowWrap: 'break-word' }}>
                      {p.name} {isCurrent && <span style={{ fontSize: 11, color: 'var(--blue)' }}>(Tum ye ho)</span>}
                    </strong>
                    <span style={{ fontSize: 11, color: 'var(--gray)' }}>
                      {(p.categories || []).join(', ') || 'General Repair'} · {p.available ? 'Online' : 'Offline'}
                      {liveJobs.length > 0 && (
                        <span style={{ color: '#D97706', fontWeight: 700 }}> · {liveJobs.length} active job(s)</span>
                      )}
                    </span>
                  </div>
                  <button
                    type="button"
                    className={isCurrent ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
                    disabled={isCurrent || !linkedUser}
                    title={!linkedUser ? 'Is provider ka login account nahi hai' : undefined}
                    onClick={() => {
                      const u = login(linkedUser.email, 'demo');
                      if (u) {
                        // Switcher changes the user without a remount, so
                        // sync the toggle/slider to the new provider here.
                        const next = getProviderByUser(u.id);
                        setAvail(next?.available ?? false);
                        setRadius(next?.serviceRadius || 5);
                        toast.success(`Ab tum ${p.name} ke roop me login ho.`);
                        navigate('/provider');
                      } else {
                        toast.warn('Is provider se login nahi ho paya.');
                      }
                    }}
                    style={{ flexShrink: 0 }}
                  >
                    {isCurrent ? 'Current' : 'Open karo'}
                  </button>
                </div>
              </div>
            );
          })}
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
                  <span>{j.location?.address || 'Thakur Village, Kandivali East, Mumbai'}</span>
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

        {/* Open requests nobody owns yet (incl. declined jobs) */}
        {openRequests.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--blue)', fontSize: 20 }}>radar</span>
              <p className="section-title" style={{ margin: 0, color: 'var(--blue)' }}>Open Requests Near You ({openRequests.length})</p>
            </div>
            <p className="muted" style={{ fontSize: 12, margin: '0 0 8px' }}>
              Jobs waiting for a provider — including jobs another provider declined.
            </p>
            {openRequests.map(j => (
              <div key={j.id} className="prov-card" style={{ border: '1.5px dashed var(--blue)', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                  <div>
                    <strong style={{ fontSize: 15 }}>{j.item} — {j.category}</strong>
                    <span style={{ display: 'block', fontSize: 12, color: 'var(--gray)', marginTop: 2 }}>{j.issue}</span>
                  </div>
                  <span className="badge badge-info" style={{ fontWeight: 700 }}>{fmt(j.visitingFee || 50)}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text)', marginBottom: 12 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--blue)' }}>location_on</span>
                  <span>{j.location?.address || 'Thakur Village, Kandivali East, Mumbai'}</span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleAcceptOpenJob(j)}
                >
                  Accept This Job
                </button>
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

      {/* Rapido/Uber-style incoming-request popup (bottom sheet). The
          inline lists above stay unchanged underneath; X only dismisses
          the popup for this session, it never accepts or declines. */}
      {popupEntry && (
        <IncomingRequestPopup
          job={popupEntry.job}
          index={popupQueue.findIndex(e => e.job.id === popupEntry.job.id)}
          total={popupQueue.length}
          isOpenRequest={popupEntry.open}
          onAccept={handlePopupAccept}
          onDecline={handlePopupDecline}
          onView={() => navigate(`/provider/job/${popupEntry.job.id}`)}
          onClose={() => setDismissed(d => [...d, popupEntry.job.id])}
        />
      )}
    </div>
  );
}
