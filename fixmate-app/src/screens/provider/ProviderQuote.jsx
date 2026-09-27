import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getJob, saveJob, calcTotal, fmt, addNotif } from '../../store';
import { useToast } from '../../context/ToastContext';
import TopBar from '../../components/TopBar';

export default function ProviderQuote() {
  const { jobId }  = useParams();
  const [searchParams] = useSearchParams();
  const isRevision = searchParams.get('revision') === 'true';
  const navigate   = useNavigate();
  const toast      = useToast();
  const job        = getJob(jobId);

  const [parts,   setParts]   = useState(job?.parts   || []);
  const [labour,  setLabour]  = useState(job?.labour  || 0);
  const [addOns,  setAddOns]  = useState(job?.addOns  || []);
  const [partName, setPartName] = useState('');
  const [partCost, setPartCost] = useState('');
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionCost, setRevisionCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!job) { navigate('/provider'); return null; }

  const visitFee = job.visitingFee || 50;
  const partsSum = parts.reduce((s, p) => s + (Number(p.cost) || 0), 0);
  const addOnsSum = addOns.reduce((s, a) => s + (Number(a.cost) || 0), 0);
  const total = visitFee + partsSum + Number(labour || 0) + addOnsSum;

  function addPart() {
    const name = partName.trim();
    const cost = parseInt(partCost, 10);
    if (!name)     { toast.warn('Enter part or material name.'); return; }
    if (!(cost > 0)){ toast.warn('Enter a valid part cost.'); return; }
    setParts(ps => [...ps, { name, cost }]);
    setPartName('');
    setPartCost('');
  }

  function removePart(idx) {
    setParts(ps => ps.filter((_, i) => i !== idx));
  }

  function addRevisionItem() {
    const reason = revisionReason.trim();
    const cost = parseInt(revisionCost, 10);
    if (!reason)   { toast.warn('Enter reason for revision (e.g. Broken valve detected during repair).'); return; }
    if (!(cost > 0)){ toast.warn('Enter revision extra cost.'); return; }
    setAddOns(as => [...as, { name: reason, cost, note: `Revision ${(job.revisions?.length || 0) + 1} of 3` }]);
    setRevisionReason('');
    setRevisionCost('');
  }

  function removeAddOn(idx) {
    setAddOns(as => as.filter((_, i) => i !== idx));
  }

  async function submitQuote() {
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 400));

    const newRevisions = [...(job.revisions || [])];
    if (addOns.length > (job.addOns?.length || 0)) {
      newRevisions.push({
        reason: addOns[addOns.length - 1].name,
        amount: addOns[addOns.length - 1].cost,
        at: Date.now()
      });
    }

    const updated = {
      ...job,
      parts,
      labour: Number(labour || 0),
      addOns,
      total,
      revisions: newRevisions,
      status: isRevision ? 'in_progress' : 'quote_sent',
    };
    saveJob(updated);
    setSubmitting(false);

    if (job.customerId) {
      addNotif(job.customerId, {
        title: isRevision ? 'Quote Revision Received' : 'Itemized Quote Ready',
        text: `Total: ${fmt(total)}. Please review breakdown and approve.`,
      });
    }

    toast.success(isRevision ? 'Revision sent to customer!' : 'Quote sent to customer!');
    navigate(`/provider/job/${job.id}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
      <TopBar title={isRevision ? "Add Change Order / Revision" : "Build Transparent Quote"} back backTo={`/provider/job/${jobId}`} />

      <div className="body screen-enter" style={{ paddingBottom: 32 }}>
        {/* Diagnosis summary */}
        {job.diagnosis && (
          <div style={{ padding: '12px 14px', background: '#EFF6FF', borderRadius: 8, marginBottom: 16, borderLeft: '4px solid var(--blue)' }}>
            <strong style={{ fontSize: 13, color: 'var(--blue)', display: 'block', marginBottom: 2 }}>Diagnosis Summary</strong>
            <span style={{ fontSize: 13, color: 'var(--text)' }}>{job.diagnosis}</span>
          </div>
        )}

        {/* Line Items Card */}
        <div className="prov-card" style={{ padding: '14px 16px', marginBottom: 16 }}>
          <p className="section-title" style={{ margin: '0 0 10px', fontSize: 13 }}>Quote Breakdown</p>

          {/* Visiting fee */}
          <div className="line-item" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="li-label">
              <strong>Visiting / Inspection Fee</strong>
              <span style={{ fontSize: 11, color: 'var(--green)' }}>✓ Fixed &amp; Standard</span>
            </div>
            <div className="li-value" style={{ fontWeight: 600 }}>{fmt(visitFee)}</div>
          </div>

          {/* Parts */}
          {parts.map((p, i) => (
            <div key={i} className="line-item" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="li-label">
                <strong>{p.name}</strong>
                <span style={{ fontSize: 11, color: 'var(--gray)' }}>Replacement Part</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="li-value" style={{ fontWeight: 600 }}>{fmt(p.cost)}</span>
                <button 
                  onClick={() => removePart(i)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 18, lineHeight: 1 }}
                  title="Remove part"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          {/* Add-ons / Revisions */}
          {addOns.map((a, i) => (
            <div key={i} className="line-item" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <div className="li-label">
                <strong style={{ color: 'var(--blue)' }}>+ {a.name}</strong>
                <span style={{ fontSize: 11, color: 'var(--blue)' }}>{a.note || 'Change Order'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="li-value" style={{ fontWeight: 600, color: 'var(--blue)' }}>{fmt(a.cost)}</span>
                <button 
                  onClick={() => removeAddOn(i)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--red)', fontSize: 18, lineHeight: 1 }}
                  title="Remove add-on"
                >
                  ×
                </button>
              </div>
            </div>
          ))}

          {/* Labour input */}
          <div className="line-item" style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
            <div className="li-label">
              <strong>Labour / Service Charge</strong>
              <span style={{ fontSize: 11, color: 'var(--gray)' }}>Service expertise</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 13, color: 'var(--gray)' }}>₹</span>
              <input
                type="number"
                min="0"
                step="50"
                value={labour}
                onChange={e => setLabour(e.target.value)}
                style={{
                  width: 90, textAlign: 'right', padding: '6px 8px',
                  border: '1.5px solid var(--border)', borderRadius: 6,
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 600
                }}
              />
            </div>
          </div>

          {/* Running Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14 }}>
            <strong style={{ fontSize: 16 }}>Total Payable</strong>
            <strong style={{ fontSize: 20, color: 'var(--blue)' }}>{fmt(total)}</strong>
          </div>
        </div>

        {/* Add Part Section */}
        <div className="prov-card" style={{ marginBottom: 16 }}>
          <p className="section-title" style={{ margin: '0 0 10px', fontSize: 13 }}>+ Add Part / Material</p>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              placeholder="e.g. Capacitor 35uF, Copper Pipe"
              value={partName}
              onChange={e => setPartName(e.target.value)}
              style={{ flex: 2, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
            />
            <input
              type="number"
              placeholder="Cost (₹)"
              value={partCost}
              onChange={e => setPartCost(e.target.value)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
              onKeyDown={e => e.key === 'Enter' && addPart()}
            />
          </div>
          <button 
            type="button"
            className="btn btn-outline btn-sm" 
            style={{ width: '100%' }}
            onClick={addPart}
          >
            + Add Line Item
          </button>
        </div>

        {/* Change Order Section */}
        <div className="prov-card" style={{ marginBottom: 20 }}>
          <p className="section-title" style={{ margin: '0 0 6px', fontSize: 13 }}>+ Add Change Order (Discovered During Work)</p>
          <span className="muted" style={{ display: 'block', fontSize: 12, marginBottom: 10 }}>
            Transparent revision flow. Customer must accept or reject this addition before work proceeds.
          </span>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <input
              type="text"
              placeholder="Reason (e.g. Hidden wiring burnt)"
              value={revisionReason}
              onChange={e => setRevisionReason(e.target.value)}
              style={{ flex: 2, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
            />
            <input
              type="number"
              placeholder="Extra (₹)"
              value={revisionCost}
              onChange={e => setRevisionCost(e.target.value)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
              onKeyDown={e => e.key === 'Enter' && addRevisionItem()}
            />
          </div>
          <button 
            type="button"
            className="btn btn-outline btn-sm" 
            style={{ width: '100%' }}
            onClick={addRevisionItem}
          >
            + Add Change Order
          </button>
        </div>

        <button 
          className="btn btn-primary" 
          onClick={submitQuote}
          disabled={submitting}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <span className="material-symbols-outlined">send</span>
          {submitting ? 'Submitting...' : `Submit Quote (${fmt(total)}) to Customer`}
        </button>
      </div>
    </div>
  );
}
