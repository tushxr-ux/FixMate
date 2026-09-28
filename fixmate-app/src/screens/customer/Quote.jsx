import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getProvider, saveJob, fmt, addNotif, Config } from '../../store';
import { useToast } from '../../context/ToastContext';
import TopBar from '../../components/TopBar';
import LineItems from '../../components/LineItems';

const DEFAULT_QUOTE = {
  diagnosis: 'Refrigerant gas pressure low, coils clogged with debris. Requires gas recharge and coil treatment.',
  parts: [{ name: 'Gas recharge & sealant', cost: 750 }],
  labour: 150,
};

// Demo revisions for the 3-revision cap flow
const DEMO_REVISIONS = [
  { name: 'Capacitor replacement',      cost: 300, reason: 'Found blown during electrical test' },
  { name: 'Thermal fuse replacement',   cost: 150, reason: 'Failed continuity test after capacitor fix' },
  { name: 'Control board re-soldering', cost: 200, reason: 'Intermittent fault traced to loose solder joint' },
];

export default function Quote() {
  const { jobId }  = useParams();
  const navigate   = useNavigate();
  const toast      = useToast();
  const [job, setJob] = useState(() => getJob(jobId));
  const provider   = job ? getProvider(job.providerId) : null;

  // 'initial' | 'revision' — revision means a pending change-order addOn is showing
  const [phase,   setPhase]   = useState(job?.addOns?.length ? 'revision' : 'initial');
  const [loading, setLoading] = useState(false);

  if (!job) { navigate('/home'); return null; }

  const diagnosisText = job.diagnosis || DEFAULT_QUOTE.diagnosis;
  const baseParts     = job.parts?.length  ? job.parts  : DEFAULT_QUOTE.parts;
  const baseLabour    = job.labour > 0     ? job.labour : DEFAULT_QUOTE.labour;
  const evidencePhotos = (job.evidence || []).filter(e => e.type === 'diagnosis');

  // Existing approved revisions on the job
  const approvedRevisions = job.revisions || [];
  const revisionCount     = approvedRevisions.length;
  const maxRevisions      = Config.maxRevisions; // 3

  // Current pending addOn (only shown in revision phase)
  const pendingAddOn = phase === 'revision'
    ? (job.addOns?.[0] || DEMO_REVISIONS[revisionCount] || DEMO_REVISIONS[0])
    : null;

  // Tiered visiting fee (§5.3): initial quote always shows ₹50;
  // fee is updated on accept/decline
  const visitFee  = job.visitingFee || Config.visitingFeeAccept;
  const partsSum  = baseParts.reduce((s, p) => s + (Number(p.cost) || 0), 0);
  const addOnSum  = pendingAddOn ? Number(pendingAddOn.cost) : 0;
  const total     = visitFee + partsSum + Number(baseLabour) + (phase === 'revision' ? addOnSum : 0);

  // ── Dev demo: trigger next revision ────────────────
  function handleSimulateRevision() {
    if (revisionCount >= maxRevisions) {
      toast.warn('Maximum 3 revisions already reached.');
      return;
    }
    const next = DEMO_REVISIONS[revisionCount];
    const updated = { ...job, addOns: [next] };
    saveJob(updated);
    setJob(updated);
    setPhase('revision');
    toast.warn(`[Dev] Revision ${revisionCount + 1} of ${maxRevisions}: ${next.name} (+${fmt(next.cost)})`);
  }

  async function handleAccept() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    if (phase === 'initial' && !job.parts?.length) {
      // Demo: jump to first revision
      setPhase('revision');
      setLoading(false);
      toast.warn('Provider discovered an additional issue. Please review revision.');
      return;
    }

    if (phase === 'revision' && pendingAddOn) {
      // §5.4: append revision to log, cap at 3
      const newRevisions = [
        ...approvedRevisions,
        { name: pendingAddOn.name, cost: pendingAddOn.cost, reason: pendingAddOn.reason || '', at: Date.now() },
      ];
      const newTotal = visitFee + partsSum + Number(baseLabour) +
        newRevisions.reduce((s, r) => s + r.cost, 0);
      const updated = {
        ...job,
        parts: baseParts, labour: baseLabour,
        addOns: [],        // pending cleared
        revisions: newRevisions,
        total: newTotal,
        visitingFee: Config.visitingFeeAccept, // §5.3
        quoteAccepted: true,
        status: newRevisions.length >= maxRevisions ? 'in_progress' : 'in_progress',
        reassembled: null, // not pending reassembly
      };
      saveJob(updated);
      setJob(updated);
      setPhase('initial'); // back to normal view
      setLoading(false);
      if (job.providerId) addNotif(job.providerId, {
        title: `Revision ${newRevisions.length} of ${maxRevisions} Approved`,
        text: `Customer approved: ${pendingAddOn.name} (+${fmt(pendingAddOn.cost)}).`,
      });
      toast.success(`Revision ${newRevisions.length} approved.`);
      if (newRevisions.length >= maxRevisions) navigate(`/complete/${jobId}`);
      return;
    }

    // Final acceptance of initial quote
    const updated = {
      ...job,
      parts: baseParts, labour: baseLabour, addOns: [],
      total, diagnosis: diagnosisText,
      visitingFee: Config.visitingFeeAccept, // §5.3: ₹50
      quoteAccepted: true, status: 'in_progress',
      revisions: approvedRevisions,
      reassembled: null,
    };
    saveJob(updated);
    setJob(updated);
    setLoading(false);
    if (job.providerId) addNotif(job.providerId, {
      title: 'Quote Approved by Customer',
      text: `Customer approved quote (${fmt(total)}). Proceed with repair.`,
    });
    toast.success('Quote approved! Repair work is in progress.');
    navigate(`/complete/${jobId}`);
  }

  function handleReject() {
    if (phase === 'revision' && pendingAddOn) {
      // §5.4: revision rejected → reassembly obligation
      const originalTotal = visitFee + partsSum + Number(baseLabour) +
        approvedRevisions.reduce((s, r) => s + r.cost, 0);
      const updated = {
        ...job,
        parts: baseParts, labour: baseLabour,
        addOns: [], total: originalTotal,
        diagnosis: diagnosisText,
        visitingFee: Config.visitingFeeAccept,
        quoteAccepted: true, status: 'in_progress',
        reassembled: 'pending', // §5.4: provider must reassemble
      };
      saveJob(updated);
      setJob(updated);
      setPhase('initial');
      if (job.providerId) addNotif(job.providerId, {
        title: 'Revision Declined — Reassembly Required',
        text: `Customer declined ${pendingAddOn.name}. You must reassemble the item before ending the visit.`,
      });
      toast.info('Change order declined. Provider must reassemble your item before leaving.');
      navigate(`/complete/${jobId}`);
    } else {
      // §5.3: quote rejected → ₹100 visiting fee
      const updated = {
        ...job,
        status: 'quote_rejected',
        visitingFee: Config.visitingFeeDecline, // ₹100
        total: Config.visitingFeeDecline,
        quoteAccepted: false,
      };
      saveJob(updated);
      setJob(updated);
      if (job.providerId) addNotif(job.providerId, {
        title: 'Quote Declined',
        text: `Customer declined repair. Visiting fee ₹${Config.visitingFeeDecline} applies.`,
      });
      toast.warn(`Quote declined. ₹${Config.visitingFeeDecline} visiting fee applies.`);
      navigate(`/done/${jobId}`);
    }
  }

  const declineFee = phase === 'initial' ? Config.visitingFeeDecline : Config.visitingFeeAccept;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
      <TopBar title="Diagnosis & Transparent Quote" back={false} />

      <div className="body screen-enter" style={{ paddingBottom: 32 }}>
        {/* Provider Tag */}
        {provider && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div className="avatar avatar-sm" style={{ background: 'var(--blue-50)', color: 'var(--blue)' }}>
              {provider.init}
            </div>
            <div>
              <strong style={{ fontSize: 13 }}>{provider.name}</strong>
              <span className="meta" style={{ fontSize: 11 }}>FixMate Verified Specialist</span>
            </div>
          </div>
        )}

        {/* Diagnosis Card */}
        <p className="section-title">Inspection Findings</p>
        <div style={{ padding: '12px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--blue)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>search_check</span>
            <strong style={{ fontSize: 13 }}>Specialist Diagnosis</strong>
          </div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--text)' }}>{diagnosisText}</p>
          {evidencePhotos.length > 0 && (
            <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>
                Inspection Photos ({evidencePhotos.length})
              </span>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {evidencePhotos.map((p, i) => (
                  <img key={i} src={p.url} alt="Diagnosis evidence"
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Approved revisions log */}
        {approvedRevisions.length > 0 && (
          <div style={{ padding: '10px 14px', background: '#FFFBEB', borderRadius: 8, border: '1px solid #FCD34D', marginBottom: 14 }}>
            <strong style={{ fontSize: 12, color: '#92400E', display: 'block', marginBottom: 6 }}>
              Approved Revisions ({approvedRevisions.length}/{maxRevisions})
            </strong>
            {approvedRevisions.map((r, i) => (
              <div key={i} style={{ fontSize: 12, color: '#92400E', display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                <span>Rev {i + 1}: {r.name} — {r.reason}</span>
                <strong>+{fmt(r.cost)}</strong>
              </div>
            ))}
          </div>
        )}

        {/* §5.4 Reassembly banner — shown when last revision was rejected */}
        {job.reassembled === 'pending' && (
          <div style={{ padding: '12px 14px', background: '#FEE2E2', borderRadius: 8, border: '1px solid #EF4444', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, color: '#991B1B' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>build</span>
              <strong style={{ fontSize: 13 }}>Reassembly Required</strong>
            </div>
            <p style={{ margin: 0, fontSize: 12, color: '#991B1B', lineHeight: 1.5 }}>
              The provider must leave your {job.item} reassembled in its original condition before ending the visit (Section 5.4).
            </p>
          </div>
        )}

        {/* Pending revision alert */}
        {phase === 'revision' && pendingAddOn && (
          <div style={{ padding: '12px 14px', background: '#FEF3C7', color: '#92400E', borderRadius: 8, marginBottom: 14, borderLeft: '4px solid #D97706' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
              <strong style={{ fontSize: 13 }}>
                Change Order / Revision {revisionCount + 1} of {maxRevisions}
                {revisionCount + 1 >= maxRevisions ? ' (Final revision)' : ''}
              </strong>
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}>
              <strong>{pendingAddOn.name}</strong> (+{fmt(pendingAddOn.cost)}) — {pendingAddOn.reason || 'Additional issue found during work'}.
              You can approve or decline without penalty.
            </p>
          </div>
        )}

        {/* Revision cap reached notice */}
        {revisionCount >= maxRevisions && (
          <div style={{ padding: '10px 14px', background: '#F8FAFC', borderRadius: 8, border: '1px solid var(--border)', marginBottom: 14, fontSize: 12, color: 'var(--gray)' }}>
            ✓ Maximum revisions reached (3/3). No further change orders can be issued for this job.
          </div>
        )}

        {/* Price Breakdown */}
        <p className="section-title">Transparent Price Breakdown</p>
        <LineItems
          visitingFee={visitFee}
          parts={baseParts}
          labour={baseLabour}
          addOns={pendingAddOn && phase === 'revision' ? [pendingAddOn] : []}
          total={total}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--green-bg, #DCFCE7)', borderRadius: 6, margin: '14px 0', fontSize: 12, color: 'var(--green, #16A34A)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified_user</span>
          <span>No hidden fees. You only pay for approved items.</span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button
            className={`btn btn-primary${loading ? ' loading' : ''}`}
            onClick={handleAccept}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {!loading && (
              phase === 'revision'
                ? <><span className="material-symbols-outlined">check_circle</span> Approve Revision {revisionCount + 1} ({fmt(total)})</>
                : <><span className="material-symbols-outlined">check_circle</span> Approve Quote &amp; Authorize Repair ({fmt(total)})</>
            )}
          </button>

          {phase === 'revision' ? (
            <button className="btn btn-outline"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
              onClick={handleReject}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              Decline Change Order — Keep Original Quote
            </button>
          ) : (
            <button className="btn btn-ghost"
              style={{ color: 'var(--gray)', fontSize: 13 }}
              onClick={handleReject}>
              Decline Repair — Pay ₹{declineFee} Visiting Fee Only
            </button>
          )}

          {/* Dev demo trigger — simulate next revision */}
          {phase === 'initial' && revisionCount < maxRevisions && (
            <button className="btn btn-outline"
              style={{ borderStyle: 'dashed', borderColor: 'var(--gray)', color: 'var(--gray)', fontSize: 11, marginTop: 4 }}
              onClick={handleSimulateRevision}>
              [Dev] Simulate issue found → Trigger Revision {revisionCount + 1} of {maxRevisions}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
