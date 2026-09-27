import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getProvider, createDispute, getDisputes, fmt } from '../../store';
import { useToast } from '../../context/ToastContext';
import TopBar from '../../components/TopBar';

const CATEGORIES = [
  { id: 'wrong_diagnosis',   label: 'Wrong Diagnosis',      desc: 'Diagnosis was incorrect or unnecessary parts replaced' },
  { id: 'unexpected_charge', label: 'Unexpected Charge',    desc: 'Billed amount exceeded approved quote or visiting fee' },
  { id: 'damage',            label: 'Property Damage',      desc: 'Appliance or home property was damaged during service' },
  { id: 'poor_repair',       label: 'Poor / Failed Repair', desc: 'The issue recurred immediately or was not fixed' },
  { id: 'no_show',           label: 'Provider No-Show',     desc: 'Specialist did not arrive at the scheduled time' },
  { id: 'other',             label: 'Other Issue',          desc: 'Professional misconduct or other complaints' },
];

export default function Dispute() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const toast     = useToast();
  const job       = getJob(jobId);
  const prov      = job ? getProvider(job.providerId) : null;

  // Check if dispute already exists for this job
  const existingDisputes = getDisputes({ jobId });
  const existing = existingDisputes[0];

  const [category, setCategory] = useState(CATEGORIES[0].id);
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!job) {
    navigate('/history');
    return null;
  }

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) {
          setEvidence(prev => [...prev, {
            name: file.name,
            url: ev.target.result,
            at: Date.now()
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} photo(s) added.`);
  }

  function removePhoto(idx) {
    setEvidence(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide details regarding the problem.');
      return;
    }

    setSubmitting(true);
    await new Promise(r => setTimeout(r, 500));

    createDispute({
      jobId: job.id,
      category,
      description: description.trim(),
      evidence,
    });

    setSubmitting(false);
    toast.success('Dispute submitted. FixMate Trust & Safety team is reviewing it.');
    navigate(`/job/${job.id}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
      <TopBar title={existing ? "Dispute Status" : "Report a Problem"} back backTo={`/job/${jobId}`} />

      <div className="body screen-enter" style={{ paddingBottom: 32 }}>
        {/* Existing Dispute Banner */}
        {existing ? (
          <div>
            <div style={{
              padding: '16px', borderRadius: 10,
              background: existing.status === 'resolved' ? 'var(--green-bg, #DCFCE7)' : '#FEF3C7',
              border: `1px solid ${existing.status === 'resolved' ? 'var(--green)' : '#D97706'}`,
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span className="material-symbols-outlined" style={{ color: existing.status === 'resolved' ? 'var(--green)' : '#D97706' }}>
                  {existing.status === 'resolved' ? 'verified' : 'hourglass_top'}
                </span>
                <strong style={{ fontSize: 15 }}>
                  {existing.status === 'resolved' ? 'Dispute Resolved' : 'Dispute Under Investigation'}
                </strong>
              </div>
              <p style={{ margin: '0 0 8px', fontSize: 13, color: 'var(--text)' }}>
                Ticket ID: <strong>{existing.id}</strong> · Filed on {existing.date}
              </p>
              <div style={{ fontSize: 12, color: 'var(--gray)' }}>
                Category: <strong>{CATEGORIES.find(c => c.id === existing.category)?.label || existing.category}</strong>
              </div>
              {existing.resolution && (
                <div style={{ marginTop: 10, padding: 10, background: '#fff', borderRadius: 6, fontSize: 13 }}>
                  <strong>Resolution:</strong> {existing.resolution}
                </div>
              )}
            </div>

            <div className="prov-card" style={{ marginBottom: 16 }}>
              <p className="section-title" style={{ margin: '0 0 8px', fontSize: 13 }}>Your Statement</p>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>
                {existing.description}
              </p>
              {existing.evidence && existing.evidence.length > 0 && (
                <div style={{ marginTop: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--gray)', display: 'block', marginBottom: 6 }}>
                    Attached Evidence ({existing.evidence.length})
                  </span>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {existing.evidence.map((p, i) => (
                      <img
                        key={i}
                        src={p.url}
                        alt="Evidence"
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate(`/job/${job.id}`)}>
              Back to Job Details
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Job Summary */}
            <div className="prov-card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ fontSize: 14 }}>{job.item}</strong>
                  <span className="meta" style={{ display: 'block', fontSize: 12 }}>
                    Provider: {prov?.name || 'Assigned Provider'} · {fmt(job.total)}
                  </span>
                </div>
                <span className="badge badge-info">{job.status}</span>
              </div>
            </div>

            {/* Category Selection */}
            <p className="section-title">Select Issue Category</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {CATEGORIES.map(c => (
                <label
                  key={c.id}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 12px', borderRadius: 8,
                    border: category === c.id ? '2px solid var(--blue)' : '1px solid var(--border)',
                    background: category === c.id ? '#EFF6FF' : '#fff',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="disputeCategory"
                    checked={category === c.id}
                    onChange={() => setCategory(c.id)}
                    style={{ marginTop: 3 }}
                  />
                  <div>
                    <strong style={{ fontSize: 13, display: 'block', color: 'var(--text)' }}>{c.label}</strong>
                    <span style={{ fontSize: 11, color: 'var(--gray)' }}>{c.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            {/* Description Field */}
            <div className="field" style={{ marginBottom: 16 }}>
              <label htmlFor="dispDesc">Explain What Happened</label>
              <textarea
                id="dispDesc"
                placeholder="Please describe the issue in detail. What did the provider do or fail to do? Include timestamps or part details if applicable."
                value={description}
                onChange={e => { setDescription(e.target.value); setError(''); }}
                className={error ? 'err' : ''}
                style={{ minHeight: 100 }}
              />
              {error && <p className="field-err">{error}</p>}
            </div>

            {/* Photo Evidence Upload */}
            <div className="field" style={{ marginBottom: 20 }}>
              <label>Supporting Evidence / Photos</label>
              <div
                style={{
                  border: '2px dashed var(--border)', borderRadius: 8, padding: 14,
                  textAlign: 'center', background: '#F8FAFC', cursor: 'pointer'
                }}
                onClick={() => document.getElementById('dispPhotoInput')?.click()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--blue)' }}>
                  upload_file
                </span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>
                  Attach photos of incomplete work, invoice mismatch, or damage
                </span>
                <input
                  id="dispPhotoInput"
                  type="file"
                  accept="image/*"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handlePhotoUpload}
                />
              </div>

              {evidence.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
                  {evidence.map((p, i) => (
                    <div key={i} style={{ position: 'relative', width: 68, height: 68 }}>
                      <img
                        src={p.url}
                        alt="Evidence thumbnail"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }}
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        style={{
                          position: 'absolute', top: -6, right: -6, width: 20, height: 20,
                          borderRadius: '50%', background: 'var(--red)', color: '#fff',
                          border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 12, cursor: 'pointer'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className={`btn btn-primary${submitting ? ' loading' : ''}`}
              disabled={submitting}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <span className="material-symbols-outlined">gavel</span>
              {submitting ? 'Submitting Dispute...' : 'Submit to Trust & Safety Team'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
