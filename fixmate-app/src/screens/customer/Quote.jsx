import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getProvider, saveJob, calcTotal, fmt, addNotif } from '../../store';
import { useToast } from '../../context/ToastContext';
import TopBar from '../../components/TopBar';
import LineItems from '../../components/LineItems';

const DEFAULT_QUOTE = {
  diagnosis: 'Refrigerant gas pressure low, coils clogged with debris. Requires gas recharge and coil treatment.',
  parts: [{ name: 'Gas recharge & sealant', cost: 750 }],
  labour: 150,
};

const SAMPLE_REVISION = {
  name: 'Capacitor replacement',
  cost: 300,
  note: 'Found blown during electrical test · Revision 1 of 3',
};

export default function Quote() {
  const { jobId }  = useParams();
  const navigate   = useNavigate();
  const toast      = useToast();
  const [job, setJob] = useState(() => getJob(jobId));
  const provider   = job ? getProvider(job.providerId) : null;

  const [phase,   setPhase]   = useState(job?.addOns?.length ? 'revision' : 'initial');
  const [loading, setLoading] = useState(false);

  if (!job) { navigate('/home'); return null; }

  const diagnosisText = job.diagnosis || DEFAULT_QUOTE.diagnosis;
  const baseParts = (job.parts && job.parts.length > 0) ? job.parts : DEFAULT_QUOTE.parts;
  const baseLabour = job.labour !== undefined && job.labour > 0 ? job.labour : DEFAULT_QUOTE.labour;
  const evidencePhotos = (job.evidence || []).filter(e => e.type === 'diagnosis');

  const addOns = phase === 'revision' 
    ? (job.addOns?.length ? job.addOns : [SAMPLE_REVISION]) 
    : [];

  const visitFee = job.visitingFee || 50;
  const partsSum = baseParts.reduce((s, p) => s + (Number(p.cost) || 0), 0);
  const addOnsSum = addOns.reduce((s, a) => s + (Number(a.cost) || 0), 0);
  const total = visitFee + partsSum + Number(baseLabour) + addOnsSum;

  async function handleAccept() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));

    if (phase === 'initial' && !job.parts?.length) {
      // Demo step: demonstrate revision flow if coming from default demo
      setPhase('revision');
      setLoading(false);
      toast.warn('Provider discovered an additional issue. Please review revision.');
      return;
    }

    // Final acceptance
    const updated = {
      ...job,
      parts: baseParts,
      labour: baseLabour,
      addOns,
      total,
      diagnosis: diagnosisText,
      quoteAccepted: true,
      status: 'in_progress',
      revisions: addOns.length ? [{ reason: addOns[0].name, amount: addOns[0].cost, at: Date.now() }] : [],
    };
    saveJob(updated);
    setJob(updated);
    setLoading(false);

    if (job.providerId) {
      addNotif(job.providerId, {
        title: 'Quote Approved by Customer',
        text: `Customer approved quote (${fmt(total)}). You may proceed with repair.`,
      });
    }

    toast.success('Quote approved! Repair work is in progress.');
    navigate(`/complete/${jobId}`);
  }

  function handleReject() {
    if (phase === 'revision') {
      // Reject just the add-on — continue with original quote
      const originalTotal = visitFee + partsSum + Number(baseLabour);
      const updated = {
        ...job,
        parts: baseParts,
        labour: baseLabour,
        addOns: [],
        total: originalTotal,
        diagnosis: diagnosisText,
        quoteAccepted: true,
        status: 'in_progress',
      };
      saveJob(updated);
      setJob(updated);

      if (job.providerId) {
        addNotif(job.providerId, {
          title: 'Revision Declined',
          text: `Customer declined additional work. Please continue with original quote (${fmt(originalTotal)}).`,
        });
      }

      toast.info('Change order declined. Proceeding with initial quote.');
      navigate(`/complete/${jobId}`);
    } else {
      // Reject entire quote — pay visiting fee only
      const updated = {
        ...job,
        status: 'quote_rejected',
        total: visitFee,
        quoteAccepted: false,
      };
      saveJob(updated);
      setJob(updated);

      if (job.providerId) {
        addNotif(job.providerId, {
          title: 'Quote Declined',
          text: `Customer declined quote. Visiting fee (${fmt(visitFee)}) applies.`,
        });
      }

      toast.warn(`Quote declined. Only ₹${visitFee} visiting fee applies.`);
      navigate(`/done/${jobId}`);
    }
  }

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
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5, color: 'var(--text)' }}>
            {diagnosisText}
          </p>

          {/* Evidence photos if available */}
          {evidencePhotos.length > 0 && (
            <div style={{ marginTop: 12, borderTop: '1px solid var(--border)', paddingTop: 10 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>
                Inspection Photos ({evidencePhotos.length})
              </span>
              <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                {evidencePhotos.map((p, i) => (
                  <img
                    key={i}
                    src={p.url}
                    alt="Diagnosis evidence"
                    style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Revision Alert Banner */}
        {phase === 'revision' && (
          <div style={{ padding: '12px 14px', background: '#FEF3C7', color: '#92400E', borderRadius: 8, marginBottom: 14, borderLeft: '4px solid #D97706' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>warning</span>
              <strong style={{ fontSize: 13 }}>Change Order / Revision Notice</strong>
            </div>
            <p style={{ margin: 0, fontSize: 12, lineHeight: 1.5 }}>
              Provider found an additional issue during work: <strong>{addOns[0]?.name}</strong> (+{fmt(addOns[0]?.cost)}).
              You can approve or decline this addition without penalty.
            </p>
          </div>
        )}

        {/* Itemized Line Items */}
        <p className="section-title">Transparent Price Breakdown</p>
        <LineItems
          visitingFee={visitFee}
          parts={baseParts}
          labour={baseLabour}
          addOns={addOns}
          total={total}
        />

        {/* Guarantee Note */}
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
              phase === 'initial'
                ? <><span className="material-symbols-outlined">check_circle</span> Approve Quote &amp; Authorize Repair ({fmt(total)})</>
                : <><span className="material-symbols-outlined">check_circle</span> Approve Revision ({fmt(total)})</>
            )}
          </button>

          {phase === 'revision' ? (
            <button 
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }} 
              onClick={handleReject}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>close</span>
              Decline Additional Work (Keep Original Quote)
            </button>
          ) : (
            <button 
              className="btn btn-ghost" 
              style={{ color: 'var(--gray)', fontSize: 13 }} 
              onClick={handleReject}
            >
              Decline Repair — Pay ₹{visitFee} Visiting Fee Only
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
