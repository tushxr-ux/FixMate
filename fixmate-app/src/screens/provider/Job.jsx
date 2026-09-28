import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, saveJob, getProvider, getUserById, fmt, addNotif, saveConfirmationCall } from '../../store';
import { useToast } from '../../context/ToastContext';
import TopBar from '../../components/TopBar';
import MapView from '../../components/MapView';

export default function ProviderJob() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();
  const [job, setJob] = useState(() => getJob(jobId));
  const [showMap, setShowMap] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Customer unavailable / no-show');
  const [afterPhoto, setAfterPhoto] = useState('');
  const [completing, setCompleting] = useState(false);

  if (!job) {
    navigate('/provider');
    return null;
  }

  const customer = job.customerId ? getUserById(job.customerId) : null;
  const prov = job.providerId ? getProvider(job.providerId) : null;

  function handleAccept() {
    const updated = { ...job, status: 'accepted' };
    saveJob(updated);
    setJob(updated);
    if (job.customerId) {
      addNotif(job.customerId, {
        title: 'Provider on the way',
        text: `${prov?.name || 'Your specialist'} has accepted your booking and is en route.`,
      });
    }
    toast.success('Job accepted! Customer has been notified.');
  }

  function handleDecline() {
    const updated = { ...job, providerId: null, status: 'pending' };
    saveJob(updated);
    toast.info('Job declined. Returning to dashboard.');
    navigate('/provider');
  }

  function handleCancelJob() {
    const updated = {
      ...job,
      status: 'cancelled_by_provider',
      cancelReason,
      cancelledAt: Date.now()
    };
    saveJob(updated);
    setJob(updated);
    setShowCancelModal(false);
    if (job.customerId) {
      addNotif(job.customerId, {
        title: 'Booking cancelled by provider',
        text: `Reason: ${cancelReason}. You may rebook another provider anytime.`,
      });
    }
    toast.warn(`Job cancelled: ${cancelReason}`);
    navigate('/provider');
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setAfterPhoto(ev.target?.result || '');
      toast.success('After-repair photo attached.');
    };
    reader.readAsDataURL(file);
  }

  function handleCompleteJob() {
    setCompleting(true);
    setTimeout(() => {
      const updatedEvidence = [...(job.evidence || [])];
      if (afterPhoto) {
        updatedEvidence.push({ type: 'after', url: afterPhoto, at: Date.now() });
      }
      const updated = {
        ...job,
        status: 'completed',
        evidence: updatedEvidence,
        completedAt: Date.now()
      };
      saveJob(updated);
      setJob(updated);
      setCompleting(false);
      if (job.customerId) {
        addNotif(job.customerId, {
          title: 'Job Completed',
          text: `${prov?.name || 'Your provider'} has finished the repair. Please verify and pay.`,
        });
      }
      toast.success('Job marked as completed! Customer can now review & pay.');
      navigate('/provider');
    }, 600);
  }

  const statusLabel = {
    matched: 'Incoming Request',
    accepted: 'Accepted / En Route',
    diagnosing: 'Diagnosing',
    quote_sent: 'Quote Sent',
    in_progress: 'Repair In Progress',
    completed: 'Completed',
    cancelled_by_customer: 'Cancelled by Customer',
    cancelled_by_provider: 'Cancelled by Provider',
    quote_rejected: 'Quote Declined (Visiting Fee Only)'
  }[job.status] || job.status;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
      <TopBar title="Job Details" back backTo="/provider" />

      <div className="body screen-enter" style={{ paddingBottom: 32 }}>
        {/* Status banner */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 16px', borderRadius: 8, marginBottom: 14,
          background: job.status === 'completed' ? 'var(--green-bg, #DCFCE7)' :
                      job.status === 'matched' ? 'var(--blue-50, #EFF6FF)' :
                      '#FEF3C7',
          color: job.status === 'completed' ? 'var(--green, #16A34A)' :
                 job.status === 'matched' ? 'var(--blue, #1A56DB)' :
                 '#92400E',
          fontWeight: 600, fontSize: 13
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {job.status === 'completed' ? 'check_circle' : 'pending_actions'}
            </span>
            <span>Status: {statusLabel}</span>
          </div>
          {job.total > 0 && <span style={{ fontWeight: 700 }}>{fmt(job.total)}</span>}
        </div>

        {/* Customer & Location Card */}
        <div className="prov-card" style={{ marginBottom: 14 }}>
          <p className="section-title" style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Customer Information
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar" style={{ background: 'var(--blue-50, #EFF6FF)', color: 'var(--blue, #1A56DB)' }}>
                {customer?.avatar || 'CU'}
              </div>
              <div>
                <strong style={{ fontSize: 15, display: 'block' }}>{customer?.name || 'Customer'}</strong>
                <span className="meta" style={{ fontSize: 12 }}>{customer?.phone || '+91 98765 43210'}</span>
              </div>
            </div>
            {customer?.phone && (
              <a 
                href={`tel:${customer.phone}`}
                className="btn btn-outline btn-sm"
                onClick={() => {
                  saveConfirmationCall(job.id, 'provider');
                  const fresh = getJob(job.id);
                  if (fresh) setJob(fresh);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>call</span>
                Call
              </a>
            )}
          </div>

          {job.confirmationCall && (
            <div style={{ marginTop: 8, marginBottom: 4, padding: '6px 10px', background: 'var(--green-bg, #DCFCE7)', borderRadius: 6, fontSize: 11, color: 'var(--green, #16A34A)' }}>
              ✓ Customer confirmation call logged ({new Date(job.confirmationCall.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })})
            </div>
          )}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 10 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--blue)', fontSize: 18, marginTop: 2 }}>location_on</span>
              <div>
                <strong style={{ display: 'block', color: 'var(--text)' }}>Service Location</strong>
                <span style={{ color: 'var(--gray)' }}>{job.location?.address || 'Thakur Village, Kandivali East, Mumbai'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details Card */}
        <div className="prov-card" style={{ marginBottom: 14 }}>
          <p className="section-title" style={{ margin: '0 0 10px', fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Issue Details
          </p>
          {[
            { label: 'Category', value: job.category },
            { label: 'Item',     value: job.item },
            { label: 'Issue',    value: job.issue },
            { label: 'Booking Type', value: job.mode === 'scheduled' ? `Scheduled: ${job.scheduledTime || 'Selected Slot'}` : 'Immediate Dispatch' },
            { label: 'Visiting Fee', value: fmt(job.visitingFee || 50) + ' (Guaranteed)' },
          ].map(({ label, value }) => (
            <div key={label} className="line-item" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="li-label" style={{ fontSize: 13 }}><strong>{label}</strong></div>
              <div className="li-value" style={{ textAlign: 'right', maxWidth: '60%', fontSize: 13 }}>{value}</div>
            </div>
          ))}

          {job.diagnosis && (
            <div style={{ marginTop: 12, padding: '10px 12px', background: '#F8FAFC', borderRadius: 6, fontSize: 13 }}>
              <strong style={{ display: 'block', marginBottom: 4, color: 'var(--blue)' }}>Diagnosis Filed:</strong>
              <div>{job.diagnosis}</div>
              {job.diagnosisNotes && (
                <div style={{ marginTop: 4, color: 'var(--gray)', fontSize: 12 }}>
                  <em>Internal notes: {job.diagnosisNotes}</em>
                </div>
              )}
            </div>
          )}

          {job.parts && job.parts.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <strong style={{ fontSize: 13, display: 'block', marginBottom: 6 }}>Quoted Parts & Labour:</strong>
              {job.parts.map((p, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>• {p.name}</span>
                  <span style={{ fontWeight: 600 }}>{fmt(p.cost)}</span>
                </div>
              ))}
              {job.labour > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                  <span>• Labour Charges</span>
                  <span style={{ fontWeight: 600 }}>{fmt(job.labour)}</span>
                </div>
              )}
              {job.addOns && job.addOns.map((a, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--blue)', marginBottom: 4 }}>
                  <span>+ Revision: {a.name}</span>
                  <span style={{ fontWeight: 600 }}>{fmt(a.cost)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Real Map Directions Preview */}
        <div style={{ marginBottom: 14 }}>
          <button 
            className="btn btn-outline" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 8 }}
            onClick={() => setShowMap(!showMap)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>map</span>
            {showMap ? 'Hide Route Map' : 'Show Route on Map'}
          </button>

          {showMap && (
            <div style={{ height: 220, borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 8 }}>
              <MapView 
                center={job.location ? [job.location.lat, job.location.lng] : [19.2085, 72.8735]}
                zoom={14}
                customerPos={job.location ? [job.location.lat, job.location.lng] : [19.2085, 72.8735]}
                providerPos={prov ? [prov.lat, prov.lng] : [19.2062, 72.8710]}
                route={[
                  prov ? [prov.lat, prov.lng] : [19.2062, 72.8710],
                  job.location ? [job.location.lat, job.location.lng] : [19.2085, 72.8735]
                ]}
              />
            </div>
          )}

          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(job.location?.address || 'Thakur Village, Kandivali East, Mumbai')}`}
            target="_blank" 
            rel="noreferrer"
            className="btn btn-ghost" 
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>open_in_new</span>
            Open Turn-by-Turn in Google Maps
          </a>
        </div>

        {/* Action Buttons based on status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {job.status === 'matched' && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1, borderColor: 'var(--red)', color: 'var(--red)' }}
                onClick={handleDecline}
              >
                Decline
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 2 }}
                onClick={handleAccept}
              >
                Accept Job
              </button>
            </div>
          )}

          {job.status === 'accepted' && (
            <button 
              className="btn btn-primary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              onClick={() => navigate(`/provider/diagnose/${job.id}`)}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>medical_information</span>
              Arrived &amp; Start Diagnosis
            </button>
          )}

          {job.status === 'quote_sent' && (
            <div style={{ textAlign: 'center', padding: '14px', background: '#EFF6FF', borderRadius: 8 }}>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--blue)', fontWeight: 600 }}>
                Quote Submitted ({fmt(job.total)})
              </p>
              <span style={{ fontSize: 12, color: 'var(--gray)' }}>
                Waiting for customer to approve from their app.
              </span>
              <button 
                className="btn btn-outline btn-sm" 
                style={{ marginTop: 10 }}
                onClick={() => navigate(`/provider/quote/${job.id}`)}
              >
                Modify / Review Quote
              </button>
            </div>
          )}

          {job.status === 'in_progress' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* §5.4: Reassembly obligation banner for provider if revision was declined */}
              {job.reassembled === 'pending' && (
                <div style={{ padding: '12px', background: '#FEF2F2', border: '1px solid #EF4444', borderRadius: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#DC2626', fontWeight: 700, fontSize: 13 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>build</span>
                    Reassembly Obligation Active (§5.4)
                  </div>
                  <p style={{ margin: '4px 0 8px', fontSize: 12, color: '#991B1B', lineHeight: 1.4 }}>
                    Customer declined revision. You must safely reassemble the {job.item} back to its initial state before ending the visit.
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    style={{ borderColor: '#DC2626', color: '#DC2626', fontSize: 12 }}
                    onClick={() => {
                      const updated = { ...job, reassembled: 'completed' };
                      saveJob(updated);
                      setJob(updated);
                      toast.success('Appliance reassembly confirmed.');
                    }}
                  >
                    ✓ Confirm Appliance Reassembled
                  </button>
                </div>
              )}
              {job.reassembled === 'completed' && (
                <div style={{ padding: '8px 12px', background: 'var(--green-bg, #DCFCE7)', borderRadius: 6, fontSize: 12, color: 'var(--green, #16A34A)' }}>
                  ✓ Appliance reassembly verified &amp; documented (§5.4).
                </div>
              )}

              {/* After repair photo upload */}
              <div style={{ padding: '12px', border: '1px dashed var(--border)', borderRadius: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, display: 'block', marginBottom: 6 }}>
                  Upload After-Repair Photo (Proof of work)
                </span>
                <input 
                  type="file" 
                  accept="image/*" 
                  id="afterPhotoInput" 
                  onChange={handlePhotoUpload} 
                  style={{ fontSize: 12, width: '100%' }}
                />
                {afterPhoto && (
                  <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <img src={afterPhoto} alt="After repair" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4 }} />
                    <span style={{ fontSize: 11, color: 'var(--green)' }}>✓ Photo attached</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button 
                  className="btn btn-outline"
                  style={{ flex: 1, fontSize: 12 }}
                  onClick={() => navigate(`/provider/quote/${job.id}?revision=true`)}
                >
                  + Add-on / Revision
                </button>
                <button 
                  className="btn btn-primary"
                  style={{ flex: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                  onClick={handleCompleteJob}
                  disabled={completing}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                  {completing ? 'Completing...' : 'Mark Complete'}
                </button>
              </div>
            </div>
          )}

          {job.status === 'completed' && (
            <div style={{ textAlign: 'center', padding: '14px', background: 'var(--green-bg, #DCFCE7)', borderRadius: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--green, #16A34A)', display: 'block' }}>
                Job Completed Successfully
              </span>
              <span style={{ fontSize: 12, color: 'var(--text)' }}>
                Earnings: {fmt(job.total)} · Rating: {job.rating ? `${job.rating} ★` : 'Awaiting review'}
              </span>
            </div>
          )}

          {['matched', 'accepted', 'in_progress'].includes(job.status) && (
            <button 
              className="btn btn-ghost"
              style={{ color: 'var(--red)', fontSize: 12, marginTop: 6 }}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel / Report Issue
            </button>
          )}
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, zIndex: 1000
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 20, maxWidth: 360, width: '100%',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 16 }}>Cancel this Job?</h4>
            <p className="muted" style={{ margin: '0 0 14px', fontSize: 13 }}>
              Select a reason for cancellation. Cancellations are logged in provider performance history.
            </p>

            <div className="field" style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12 }}>Reason</label>
              <select 
                value={cancelReason} 
                onChange={e => setCancelReason(e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
              >
                <option value="Customer unavailable / no-show">Customer unavailable / no-show</option>
                <option value="Severe safety hazard">Severe safety hazard</option>
                <option value="Parts completely unavailable">Parts completely unavailable</option>
                <option value="Customer requested cancellation">Customer requested cancellation</option>
                <option value="Equipment failure">Equipment failure</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                onClick={() => setShowCancelModal(false)}
              >
                Back
              </button>
              <button 
                className="btn btn-primary" 
                style={{ flex: 1, background: 'var(--red)', borderColor: 'var(--red)' }}
                onClick={handleCancelJob}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
