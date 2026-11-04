import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { getProvider, getUserById, getJobs, saveProvider, fmt, getProviderPhone } from '../../store';
import { useToast } from '../../context/ToastContext';
import TopBar from '../../components/TopBar';
import EmptyState from '../../components/EmptyState';

/**
 * Admin profile detail: /admin/profile/:kind/:id
 * kind = 'provider' | 'customer'. Opened by tapping any row in the
 * admin Dashboard (verification queue, roster, active jobs, customers).
 * Providers get Verify/Unverify and Suspend/Unsuspend toggles that write
 * the existing provider flags — no new backend, no fake verification.
 * Customers get no verification controls: the screen says so plainly.
 */
export default function AdminProfileDetail() {
  const { kind, id } = useParams();
  const toast = useToast();
  const [, forceUpdate] = useState(0);

  const isProvider = kind === 'provider';
  const prov = isProvider ? getProvider(id) : null;
  const user = isProvider
    ? (prov?.userId ? getUserById(prov.userId) : null)
    : getUserById(id);
  const person = prov || user;

  if (!person) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
        <TopBar title="Profile" back backTo="/admin" />
        <div className="body screen-enter">
          <EmptyState icon="🔍" title="Profile not found" body="This person no longer exists in the stored data." />
        </div>
      </div>
    );
  }

  const jobs = isProvider
    ? getJobs({ providerId: prov.id })
    : getJobs().filter(j => j.customerId === id);
  const completed = jobs.filter(j => j.status === 'completed');
  const phone = isProvider ? (getProviderPhone(prov) || user?.phone || '') : (user?.phone || '');

  function toggleVerify() {
    if (!prov) return;
    const verified = !prov.verified;
    saveProvider({ ...prov, verified, idVerified: verified, bizVerified: verified });
    toast.success(verified ? `${prov.name} is now FixMate Verified.` : `${prov.name} verification removed.`);
    forceUpdate(n => n + 1);
  }

  function toggleSuspend() {
    if (!prov) return;
    const suspended = !prov.suspended;
    saveProvider({ ...prov, suspended, available: suspended ? false : prov.available });
    toast.success(suspended ? `${prov.name} suspended.` : `${prov.name} suspension lifted.`);
    forceUpdate(n => n + 1);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
      <TopBar title={isProvider ? 'Provider Profile' : 'Customer Profile'} back backTo="/admin" />

      <div className="body screen-enter" style={{ paddingBottom: 32 }}>
        <div className="prov-card" style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
            <div className="avatar avatar-lg">{person.init || person.avatar || (isProvider ? 'PR' : 'CU')}</div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{ margin: 0, overflowWrap: 'break-word' }}>{person.name}</h3>
              <span className="meta" style={{ display: 'block' }}>{user?.email || 'No email on record'}</span>
              <span className="meta" style={{ display: 'block' }}>
                {isProvider ? 'Provider' : 'Customer'}
                {isProvider && (
                  <>
                    {' · '}
                    <span className={`badge ${prov.verified ? 'badge-success' : 'badge-warning'}`}>
                      {prov.verified ? 'Verified' : 'Unverified'}
                    </span>
                    {prov.suspended && <span className="badge badge-danger" style={{ marginLeft: 6 }}>Suspended</span>}
                  </>
                )}
              </span>
            </div>
          </div>

          {[
            { label: 'Phone', value: phone || 'Not available' },
            { label: 'Address', value: person.address || prov?.area || 'Not set' },
            ...(isProvider ? [
              { label: 'Categories', value: (prov.categories || []).join(', ') || 'General Repair' },
              { label: 'Area', value: prov.area || 'Not set' },
              { label: 'Rating', value: prov.rating ? `★ ${prov.rating} (${prov.totalJobs} completed jobs)` : 'No ratings yet' },
              { label: 'Service radius', value: `${prov.serviceRadius || 0} km` },
              { label: 'Status', value: prov.suspended ? 'Suspended' : (prov.available ? 'Online' : 'Offline') },
              { label: 'No-shows / Cancellations', value: `${prov.noShows || 0} / ${prov.cancellations || 0}` },
            ] : [
              { label: 'Wallet balance', value: fmt(user?.wallet?.balance || 0) },
            ]),
          ].map(({ label, value }) => (
            <div key={label} className="line-item" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="li-label" style={{ fontSize: 13, minWidth: 0 }}><strong>{label}</strong></div>
              <div className="li-value" style={{ textAlign: 'right', maxWidth: '60%', minWidth: 0, fontSize: 13, overflowWrap: 'break-word', whiteSpace: 'normal' }}>{value}</div>
            </div>
          ))}
        </div>

        {isProvider ? (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={toggleVerify}>
              {prov.verified ? 'Remove Verification' : 'Verify Provider'}
            </button>
            <button
              type="button" className="btn btn-outline btn-sm"
              style={{ flex: 1, color: prov.suspended ? 'var(--green)' : 'var(--red)', borderColor: prov.suspended ? 'var(--green)' : 'var(--red)' }}
              onClick={toggleSuspend}
            >
              {prov.suspended ? 'Unsuspend' : 'Suspend'}
            </button>
          </div>
        ) : (
          <p style={{ fontSize: 12, color: 'var(--gray)', margin: '0 0 16px' }}>
            No verification needed for customers — verification applies to providers only.
          </p>
        )}

        <p className="section-title">Jobs ({jobs.length})</p>
        {jobs.length === 0 ? (
          <EmptyState icon="📋" title="No jobs yet" body={isProvider ? 'This provider has no jobs on record.' : 'This customer has no jobs on record.'} />
        ) : (
          jobs.map(j => (
            <div key={j.id} className="hist-row" style={{ cursor: 'default' }}>
              <div className="avatar" style={{ background: 'var(--blue-50)', color: 'var(--blue)' }}>
                <span className="material-symbols-outlined">handyman</span>
              </div>
              <div className="info">
                <strong>{j.item} — {j.category}</strong>
                <span>{j.date || j.status}</span>
              </div>
              <span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{j.status.replace('_', ' ')}</span>
            </div>
          ))
        )}
        {completed.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--gray)', marginTop: 10 }}>
            Completed: {completed.length} · Earnings on completed jobs: {fmt(completed.reduce((s, j) => s + (j.total || 0), 0))}
          </p>
        )}
      </div>
    </div>
  );
}
