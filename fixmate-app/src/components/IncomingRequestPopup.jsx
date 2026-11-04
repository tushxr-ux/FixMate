import { getUserById, fmt } from '../store';

/**
 * Rapido/Uber-style incoming-request popup (bottom sheet).
 *
 * Shown on the Provider Dashboard while the provider is available and
 * has at least one incoming (matched) job or open (pending) request.
 * One popup at a time: the first job in the queue, with a
 * "1 of N requests" indicator when more are waiting.
 *
 * Privacy rule (ride-hailing pattern): the customer's phone number is
 * NEVER shown here. The provider sees it only after accepting, on the
 * Job screen. Closing with X neither accepts nor declines — the job
 * stays in the lists underneath.
 */
export default function IncomingRequestPopup({
  job, index, total, isOpenRequest, onAccept, onDecline, onView, onClose,
}) {
  if (!job) return null;
  const customer = job.customerId ? getUserById(job.customerId) : null;

  return (
    <div
      role="dialog"
      aria-label="New job request"
      style={{
        position: 'fixed', inset: 0, zIndex: 900,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', width: '100%', maxWidth: 480,
          borderRadius: '20px 20px 0 0', padding: '12px 16px 20px',
          boxShadow: '0 -8px 30px rgba(0,0,0,0.25)', maxHeight: '85vh',
          overflowY: 'auto', boxSizing: 'border-box',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
          <span style={{ width: 40, height: 4, borderRadius: 4, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <strong style={{ fontSize: 14, color: 'var(--blue)' }}>
            {isOpenRequest ? '📡 Open Request Near You' : '⚡ New Job Request'}
          </strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {total > 1 && (
              <span style={{ fontSize: 12, color: 'var(--gray)', fontWeight: 600 }}>
                {index + 1} of {total} requests
              </span>
            )}
            <button
              type="button" onClick={onClose} aria-label="Close popup"
              style={{ border: 'none', background: '#F1F5F9', width: 28, height: 28, borderRadius: '50%', fontSize: 16, cursor: 'pointer', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div className="avatar avatar-md">{customer?.avatar || 'CU'}</div>
          <div style={{ minWidth: 0 }}>
            <strong style={{ fontSize: 15, display: 'block' }}>{customer?.name || 'Customer'}</strong>
            <span style={{ fontSize: 12, color: 'var(--gray)' }}>
              {job.item} — {job.category}
            </span>
          </div>
          <span className="badge badge-info" style={{ marginLeft: 'auto', fontWeight: 700, whiteSpace: 'nowrap' }}>
            {fmt(job.visitingFee || 50)}
          </span>
        </div>

        <p style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
          {job.issue}
        </p>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 12, color: 'var(--text)', marginBottom: 4 }}>
          <span className="material-symbols-outlined" style={{ fontSize: 16, color: 'var(--blue)' }}>location_on</span>
          <span style={{ overflowWrap: 'break-word', minWidth: 0 }}>
            {job.location?.address || 'Thakur Village, Kandivali East, Mumbai'}
          </span>
        </div>
        {job.distKm ? (
          <div style={{ fontSize: 12, color: 'var(--gray)', marginBottom: 4 }}>
            Distance: {job.distKm} km away
          </div>
        ) : null}
        <p style={{ fontSize: 11, color: 'var(--gray)', margin: '8px 0 14px' }}>
          Customer ka phone number accept karne ke baad dikhega.
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button" className="btn btn-outline btn-sm"
            style={{ flex: 1, borderColor: 'var(--red)', color: 'var(--red)' }}
            onClick={onDecline}
          >
            Decline
          </button>
          <button
            type="button" className="btn btn-outline btn-sm" style={{ flex: 1 }}
            onClick={onView}
          >
            View details
          </button>
          <button
            type="button" className="btn btn-primary btn-sm" style={{ flex: 1.5 }}
            onClick={onAccept}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
