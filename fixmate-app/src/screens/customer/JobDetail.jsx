import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getProvider, getDisputes, fmt } from '../../store';
import TopBar from '../../components/TopBar';
import LineItems from '../../components/LineItems';

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const job       = getJob(jobId);
  const prov      = job ? getProvider(job.providerId) : null;
  const disputes  = getDisputes({ jobId });
  const dispute   = disputes[0];

  if (!job) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        <TopBar title="Job Detail" back backTo="/history" />
        <div className="body"><p className="muted">Job record not found.</p></div>
      </div>
    );
  }

  const diagnosisPhotos = (job.evidence || []).filter(e => e.type === 'diagnosis');
  const afterPhotos     = (job.evidence || []).filter(e => e.type === 'after');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
      <TopBar title="Service Record & Invoice" back backTo="/history" />

      <div className="body screen-enter" style={{ paddingBottom: 32 }}>
        {/* Dispute banner if active */}
        {dispute && (
          <div 
            onClick={() => navigate(`/dispute/${job.id}`)}
            style={{
              padding: '12px 14px', borderRadius: 8, marginBottom: 14, cursor: 'pointer',
              background: dispute.status === 'resolved' ? 'var(--green-bg, #DCFCE7)' : '#FEF3C7',
              border: `1px solid ${dispute.status === 'resolved' ? 'var(--green)' : '#D97706'}`,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}
          >
            <div>
              <strong style={{ fontSize: 13, display: 'block', color: dispute.status === 'resolved' ? 'var(--green)' : '#92400E' }}>
                Dispute: {dispute.status === 'resolved' ? 'Resolved ✓' : 'Under Review ⏳'}
              </strong>
              <span style={{ fontSize: 11, color: 'var(--gray)' }}>Ticket #{dispute.id}</span>
            </div>
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--gray)' }}>chevron_right</span>
          </div>
        )}

        {/* Provider summary card */}
        {prov && (
          <div className="prov-card" style={{ marginBottom: 14 }}>
            <div className="prov-top">
              <div className="avatar avatar-lg">{prov.init}</div>
              <div>
                <h3 style={{ margin: 0, fontSize: 15 }}>{prov.name}</h3>
                <span className="meta" style={{ fontSize: 12 }}>Service Date: {job.date}</span>
              </div>
            </div>
            <div className="verify-strip" style={{ marginTop: 10 }}>
              {prov.verified && (
                <div className="verify-chip yes">
                  <span className="material-symbols-outlined">verified</span> FixMate Verified
                </div>
              )}
              {prov.idVerified && (
                <div className="verify-chip yes">
                  <span className="material-symbols-outlined">verified_user</span> ID Verified
                </div>
              )}
            </div>
          </div>
        )}

        {/* Diagnosis & Findings */}
        {job.diagnosis && (
          <div className="prov-card" style={{ marginBottom: 14 }}>
            <p className="section-title" style={{ margin: '0 0 6px', fontSize: 13 }}>Inspection Findings</p>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
              🔍 {job.diagnosis}
            </p>
          </div>
        )}

        {/* Photographic Evidence: Before & After */}
        {(diagnosisPhotos.length > 0 || afterPhotos.length > 0) && (
          <div className="prov-card" style={{ marginBottom: 14 }}>
            <p className="section-title" style={{ margin: '0 0 8px', fontSize: 13 }}>Service Evidence Photos</p>
            {diagnosisPhotos.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>
                  Before Repair / Diagnosis
                </span>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {diagnosisPhotos.map((p, i) => (
                    <img key={i} src={p.url} alt="Before repair" style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  ))}
                </div>
              </div>
            )}
            {afterPhotos.length > 0 && (
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--green)', display: 'block', marginBottom: 6 }}>
                  After Repair (Completed Work)
                </span>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {afterPhotos.map((p, i) => (
                    <img key={i} src={p.url} alt="After repair" style={{ width: 68, height: 68, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Revisions history */}
        {job.revisions?.length > 0 && (
          <div className="prov-card" style={{ marginBottom: 14, background: '#FFFBEB' }}>
            <p className="section-title" style={{ margin: '0 0 8px', fontSize: 13, color: '#92400E' }}>Approved Revisions</p>
            {job.revisions.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4, color: '#92400E' }}>
                <span>Revision {i + 1}: {r.reason}</span>
                <strong>+{fmt(r.amount)}</strong>
              </div>
            ))}
          </div>
        )}

        {/* Invoice breakdown */}
        <p className="section-title">
          {job.status === 'completed' ? 'Itemized Invoice' : 'Quote Breakdown'}
        </p>
        <LineItems
          visitingFee={job.visitingFee}
          parts={job.parts || []}
          labour={job.labour || 0}
          addOns={job.addOns || []}
          total={job.total}
        />

        {/* Rating if provided */}
        {job.rating > 0 && (
          <div className="prov-card" style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: 13, display: 'block' }}>Your Rating</strong>
              <span className="meta" style={{ fontSize: 11 }}>Submitted after completion</span>
            </div>
            <div style={{ display: 'flex', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(n => (
                <span key={n} className="material-symbols-outlined"
                  style={{
                    color: n <= job.rating ? '#f59e0b' : 'var(--border)',
                    fontSize: 20,
                    fontVariationSettings: n <= job.rating ? "'FILL' 1" : "'FILL' 0",
                  }}>
                  star
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/items/${job.category}`)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <span className="material-symbols-outlined">refresh</span> 
            Book Again with {prov?.name ? prov.name.split(' ')[0] : 'Specialist'}
          </button>

          <button 
            className="btn btn-outline"
            onClick={() => navigate(`/dispute/${job.id}`)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
          >
            <span className="material-symbols-outlined">report_problem</span>
            {dispute ? 'View Dispute Details' : 'Report a Problem / Raise Dispute'}
          </button>
        </div>
      </div>
    </div>
  );
}
