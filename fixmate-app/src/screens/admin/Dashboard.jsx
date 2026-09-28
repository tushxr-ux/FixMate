import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getJobs, getProviders, saveProvider, getProvider, getDisputes, saveDispute, fmt, addNotif, CATEGORIES } from '../../store';
import EmptyState from '../../components/EmptyState';

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate   = useNavigate();
  const toast      = useToast();

  const [activeTab, setActiveTab] = useState('verification'); // verification | disputes | jobs | providers | coverage
  const [, forceUpdate] = useState(0);

  const allJobs  = getJobs();
  const allProvs = getProviders();
  const disputes = getDisputes();

  const pendingProvs = allProvs.filter(p => !p.verified);
  const openDisputes = disputes.filter(d => d.status === 'under_review');
  const activeJobs   = allJobs.filter(j => ['matched', 'accepted', 'in_progress', 'quote_sent'].includes(j.status));
  const completedJobs= allJobs.filter(j => j.status === 'completed');
  const totalRevenue = completedJobs.reduce((s, j) => s + (j.total || 0), 0);

  function verifyProvider(provId) {
    const prov = getProvider(provId);
    if (!prov) return;
    saveProvider({ ...prov, verified: true, idVerified: true, bizVerified: true });
    toast.success(`${prov.name} is now FixMate Verified.`);
    forceUpdate(n => n + 1);
  }

  function resolveDispute(dispId, action) {
    const disp = disputes.find(d => d.id === dispId);
    if (!disp) return;

    // §6.4: suspension only available when prior dispute count >= threshold
    if (action === 'suspend' && (disp.priorDisputeCount || 0) < 3) {
      toast.warn(`Suspension requires ≥3 prior disputes. This provider has ${disp.priorDisputeCount || 0}.`);
      return;
    }

    const resolutionMap = {
      refund:           'Full refund approved and processed for customer.',
      partial_refund:   'Partial refund (50%) issued. Both parties notified.',
      provider_warning: 'Formal warning issued to provider. Dispute logged in record.',
      rejected:         'Dispute reviewed and dismissed based on service logs.',
      suspend:          'Provider account suspended pending review (≥3 dispute pattern).',
    };

    const statusMap = {
      refund:           'resolved',
      partial_refund:   'partial_refund',
      provider_warning: 'provider_warning',
      rejected:         'rejected',
      suspend:          'resolved',
    };

    const updated = {
      ...disp,
      status: statusMap[action] || 'resolved',
      resolution: resolutionMap[action] || 'Resolved.',
      resolvedAt: Date.now(),
    };
    saveDispute(updated);

    if (disp.customerId) {
      addNotif(disp.customerId, {
        title: action === 'refund' ? 'Dispute Resolved — Refund Approved'
          : action === 'partial_refund' ? 'Dispute Resolved — Partial Refund'
          : action === 'provider_warning' ? 'Your Dispute Has Been Reviewed'
          : 'Dispute Reviewed',
        text: resolutionMap[action],
      });
    }

    if (action === 'suspend' && disp.providerId) {
      const prov = getProvider(disp.providerId);
      if (prov) saveProvider({ ...prov, available: false, suspended: true });
    }

    toast.success('Dispute ' + action.replace('_', ' ') + '.');
    forceUpdate(n => n + 1);
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* TopBar */}
      <div className="topbar">
        <h2>FixMate Ops &amp; Admin</h2>
        <button className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </div>

      <div className="body screen-enter" style={{ paddingBottom: 32 }}>
        {/* KPI Grid */}
        <div className="admin-grid" style={{ marginBottom: 16 }}>
          <div className="admin-card">
            <div className="val">{allJobs.length}</div>
            <div className="lbl">Total Jobs</div>
          </div>
          <div className="admin-card">
            <div className="val" style={{ color: 'var(--amber, #D97706)' }}>{pendingProvs.length}</div>
            <div className="lbl">Pending Verification</div>
          </div>
          <div className="admin-card">
            <div className="val" style={{ color: 'var(--red, #EF4444)' }}>{openDisputes.length}</div>
            <div className="lbl">Open Disputes</div>
          </div>
          <div className="admin-card">
            <div className="val" style={{ color: 'var(--blue, #1A56DB)' }}>{fmt(totalRevenue)}</div>
            <div className="lbl">Total GMV</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4 }}>
          {[
            { id: 'verification', label: `Verification (${pendingProvs.length})`, icon: 'verified_user' },
            { id: 'disputes',     label: `Disputes (${openDisputes.length})`,     icon: 'gavel' },
            { id: 'jobs',         label: `Active Jobs (${activeJobs.length})`,    icon: 'assignment' },
            { id: 'providers',    label: `Providers (${allProvs.length})`,       icon: 'engineering' },
            { id: 'coverage',     label: 'Coverage Gaps',                         icon: 'radar' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
              style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Verification Queue */}
        {activeTab === 'verification' && (
          <div>
            <p className="section-title">Provider Onboarding Queue</p>
            {pendingProvs.length === 0 ? (
              <EmptyState icon="✅" title="Queue clear" body="All providers have been vetted and verified." />
            ) : (
              pendingProvs.map(p => (
                <div key={p.id} className="prov-card" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div className="avatar avatar-md">{p.init}</div>
                      <div>
                        <strong style={{ fontSize: 15 }}>{p.name}</strong>
                        <span className="meta" style={{ display: 'block', fontSize: 12 }}>
                          Categories: {p.categories.join(', ') || 'General Repair'}
                        </span>
                      </div>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => verifyProvider(p.id)}>
                      Approve &amp; Verify
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 12, fontSize: 12, color: 'var(--gray)' }}>
                    <span>Radius: <strong>{p.serviceRadius} km</strong></span>
                    <span>Completed: <strong>{p.totalJobs} jobs</strong></span>
                    <span>Cancellations: <strong>{p.cancellations || 0}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 2: Disputes Queue */}
        {activeTab === 'disputes' && (
          <div>
            <p className="section-title">Customer Complaints &amp; Disputes</p>
            {disputes.length === 0 ? (
              <EmptyState icon="🤝" title="Zero disputes" body="No complaints or claims filed by customers." />
            ) : (
              disputes.map(d => {
                const job = allJobs.find(j => j.id === d.jobId);
                const prov = job ? getProvider(job.providerId) : null;
                const canSuspend = (d.priorDisputeCount || 0) >= 3;
                return (
                  <div key={d.id} className="prov-card" style={{ marginBottom: 12, border: d.status === 'under_review' ? '1.5px solid #F59E0B' : '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <strong style={{ fontSize: 14 }}>{d.customerName || 'Customer'}</strong>
                        <span className="meta" style={{ display: 'block', fontSize: 11 }}>
                          Against {prov?.name || 'Provider'} · Ticket #{d.id}
                        </span>
                        {/* §6.4: prior dispute pattern count */}
                        {(d.priorDisputeCount || 0) > 0 && (
                          <span style={{ fontSize: 11, color: d.priorDisputeCount >= 3 ? '#DC2626' : '#D97706', fontWeight: 600 }}>
                            ⚠ {d.priorDisputeCount} prior dispute(s) against this provider{d.priorDisputeCount >= 3 ? ' — Suspension eligible' : ''}
                          </span>
                        )}
                      </div>
                      <span className={`badge ${d.status === 'resolved' ? 'badge-success' : d.status === 'under_review' ? 'badge-warning' : 'badge-danger'}`}>
                        {d.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div style={{ background: '#F8FAFC', padding: 10, borderRadius: 6, margin: '8px 0', fontSize: 13 }}>
                      <strong style={{ color: 'var(--red)', display: 'block', marginBottom: 2 }}>
                        Category: {d.category}
                      </strong>
                      <p style={{ margin: 0, color: 'var(--text)' }}>{d.description}</p>
                    </div>

                    {d.evidence && d.evidence.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto' }}>
                        {d.evidence.map((p, idx) => (
                          <img key={idx} src={p.url} alt="Evidence" style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }} />
                        ))}
                      </div>
                    )}

                    {d.status === 'under_review' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-primary btn-sm"
                            style={{ flex: 1, background: 'var(--green)', borderColor: 'var(--green)' }}
                            onClick={() => resolveDispute(d.id, 'refund')}>
                            Full Refund
                          </button>
                          <button className="btn btn-outline btn-sm" style={{ flex: 1 }}
                            onClick={() => resolveDispute(d.id, 'partial_refund')}>
                            Partial Refund (50%)
                          </button>
                        </div>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" style={{ flex: 1, color: '#D97706', borderColor: '#D97706' }}
                            onClick={() => resolveDispute(d.id, 'provider_warning')}>
                            Issue Warning
                          </button>
                          <button className="btn btn-outline btn-sm"
                            style={{ flex: 1, borderColor: 'var(--gray)', color: 'var(--gray)' }}
                            onClick={() => resolveDispute(d.id, 'rejected')}>
                            Dismiss
                          </button>
                        </div>
                        {/* §6.4: suspension only when ≥3 prior disputes */}
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ color: canSuspend ? '#DC2626' : 'var(--gray)', borderColor: canSuspend ? '#DC2626' : 'var(--border)', fontSize: 11 }}
                          onClick={() => resolveDispute(d.id, 'suspend')}
                          title={canSuspend ? 'Suspend provider (pattern threshold met)' : `Needs ≥3 prior disputes (${d.priorDisputeCount || 0} now)`}>
                          {canSuspend ? '🚫 Suspend Provider' : `Suspend (needs ${3 - (d.priorDisputeCount||0)} more dispute(s))`}
                        </button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 6 }}>
                        <em>Resolution: {d.resolution}</em>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 3: Active Jobs Monitor */}
        {activeTab === 'jobs' && (
          <div>
            <p className="section-title">Active Live Operations</p>
            {activeJobs.length === 0 ? (
              <EmptyState icon="⏳" title="No active jobs" body="There are currently no dispatch requests in transit." />
            ) : (
              activeJobs.map(j => {
                const prov = getProvider(j.providerId);
                return (
                  <div key={j.id} className="hist-row">
                    <div className="avatar" style={{ background: 'var(--blue-50)', color: 'var(--blue)' }}>
                      <span className="material-symbols-outlined">bolt</span>
                    </div>
                    <div className="info">
                      <strong>{j.item} — {j.category}</strong>
                      <span>Assigned: {prov?.name || 'Unassigned'} · {j.location?.address || 'Mumbai'}</span>
                    </div>
                    <span className="badge badge-info">{j.status}</span>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 4: Providers & Performance */}
        {activeTab === 'providers' && (
          <div>
            <p className="section-title">Provider Roster &amp; Trust Signals</p>
            {allProvs.map(p => (
              <div key={p.id} className="prov-card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div className="avatar avatar-md">{p.init}</div>
                    <div>
                      <strong style={{ fontSize: 14 }}>{p.name}</strong>
                      <span className="meta" style={{ display: 'block', fontSize: 11 }}>
                        Rating: ★ {p.rating} ({p.totalJobs} jobs)
                      </span>
                    </div>
                  </div>
                  <span className={`badge ${p.verified ? 'badge-success' : 'badge-warning'}`}>
                    {p.verified ? 'Verified' : 'Unverified'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--gray)' }}>
                  <span>No-shows: <strong>{p.noShows || 0}</strong></span>
                  <span>Cancellations: <strong>{p.cancellations || 0}</strong></span>
                  <span>Status: <strong>{p.available ? 'Online' : 'Offline'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 5: Coverage Gaps View */}
        {activeTab === 'coverage' && (
          <div>
            <p className="section-title">Hyperlocal Coverage Analysis (Kandivali &amp; Thakur Village, Mumbai)</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {CATEGORIES.map(cat => {
                const activeInCat = allProvs.filter(p => p.categories.includes(cat.id) && p.available);
                const isAdequate = activeInCat.length >= 2;
                return (
                  <div key={cat.id} className="prov-card" style={{ borderLeft: `4px solid ${isAdequate ? 'var(--green)' : 'var(--red)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="material-symbols-outlined" style={{ color: 'var(--blue)' }}>{cat.icon}</span>
                        <div>
                          <strong style={{ fontSize: 14 }}>{cat.name}</strong>
                          <span className="meta" style={{ display: 'block', fontSize: 11 }}>
                            Active providers in 5km: {activeInCat.length}
                          </span>
                        </div>
                      </div>
                      <span className={`badge ${isAdequate ? 'badge-success' : 'badge-danger'}`}>
                        {isAdequate ? 'Good Coverage' : 'Supply Gap (Recruit)'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
