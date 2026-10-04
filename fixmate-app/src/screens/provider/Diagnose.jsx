import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, saveJob } from '../../store';
import { useToast } from '../../context/ToastContext';
import TopBar from '../../components/TopBar';
import Spinner from '../../components/Spinner';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;

async function askGemini(reportedIssue, item, observation) {
  if (!GEMINI_KEY) throw new Error('No API key configured');
  const prompt = [
    `You are an expert automotive/appliance mechanic assistant.`,
    `Vehicle/Item: ${item}`,
    `Customer reported issue: ${reportedIssue}`,
    observation ? `Mechanic\'s initial observation: ${observation}` : '',
    ``,
    `In 2-3 concise sentences, provide a professional diagnosis: root cause, affected component, and the most likely repair action needed.`,
    `Keep it factual, jargon-appropriate for a mechanic, and avoid disclaimers.`,
  ].filter(Boolean).join('\n');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      signal: AbortSignal.timeout(15000),
    }
  );
  if (!res.ok) throw new Error(`Gemini error ${res.status}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

export default function Diagnose() {
  const { jobId }  = useParams();
  const navigate   = useNavigate();
  const toast      = useToast();
  const job        = getJob(jobId);

  const [diagnosis, setDiagnosis] = useState(job?.diagnosis || '');
  const [notes,     setNotes]     = useState(job?.diagnosisNotes || '');
  const [photos,    setPhotos]    = useState(job?.evidence || []);
  const [error,     setError]     = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  async function handleAiSuggest() {
    setAiLoading(true);
    try {
      const suggestion = await askGemini(job.issue, job.item, diagnosis);
      if (suggestion) {
        setDiagnosis(suggestion);
        setError('');
        toast.success('AI diagnosis suggestion applied — review and edit as needed.');
      } else {
        toast.warn('AI returned an empty response. Try again.');
      }
    } catch (e) {
      toast.warn('AI suggestion failed — ' + (e.message?.includes('key') ? 'check your Gemini API key.' : 'check internet connection.'));
    } finally {
      setAiLoading(false);
    }
  }

  if (!job) { navigate('/provider'); return null; }

  function handlePhotoUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) {
          setPhotos(prev => [...prev, {
            type: 'diagnosis',
            name: file.name,
            url: ev.target.result,
            at: Date.now()
          }]);
        }
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${files.length} photo(s) attached.`);
  }

  function removePhoto(idx) {
    setPhotos(prev => prev.filter((_, i) => i !== idx));
  }

  function handleNext() {
    if (!diagnosis.trim()) { setError('Please enter your diagnosis findings.'); return; }
    const updated = {
      ...job,
      status: 'diagnosing',
      diagnosis: diagnosis.trim(),
      diagnosisNotes: notes.trim(),
      evidence: photos,
    };
    saveJob(updated);
    toast.success('Diagnosis and evidence saved.');
    navigate(`/provider/quote/${job.id}`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
      <TopBar title="Diagnosis & Evidence" back backTo={`/provider/job/${jobId}`} />

      <div className="body screen-enter" style={{ paddingBottom: 32 }}>
        <div className="prov-card" style={{ marginBottom: 16 }}>
          <strong>{job.item}</strong>
          <span className="muted" style={{ display: 'block', marginTop: 4 }}>
            Reported Issue: {job.issue}
          </span>
          <span className="meta" style={{ display: 'block', marginTop: 4, fontSize: 12 }}>
            Location: {job.location?.address || 'Customer premise'}
          </span>
        </div>

        <div className="field">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <label htmlFor="diagText" style={{ margin: 0 }}>What did you find? (Customer Visible)</label>
            <button
              type="button"
              onClick={handleAiSuggest}
              disabled={aiLoading}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 8,
                background: aiLoading ? 'var(--border)' : 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: '#fff', border: 'none', fontSize: 11, fontWeight: 700,
                cursor: aiLoading ? 'default' : 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              }}
              title="Ask Gemini AI for a diagnosis suggestion"
            >
              {aiLoading
                ? <><Spinner size={12} color="#fff" /> Thinking…</>
                : <><span style={{ fontSize: 14 }}>✨</span> AI Suggest</>}
            </button>
          </div>
          <textarea
            id="diagText"
            placeholder="Describe the root cause clearly (e.g. Capacitor blown, drain pipe choked, refrigerant gas leak). Or tap ✨ AI Suggest above."
            value={diagnosis}
            onChange={e => { setDiagnosis(e.target.value); setError(''); }}
            className={error ? 'err' : ''}
            style={{ minHeight: 90 }}
          />
          {error && <p className="field-err">{error}</p>}
          {GEMINI_KEY && (
            <p style={{ fontSize: 10, color: 'var(--gray)', marginTop: 4, lineHeight: 1.4 }}>
              ✨ AI suggestions are generated by Gemini and should be reviewed by the mechanic before saving.
            </p>
          )}
        </div>

        {/* Evidence Photos Upload */}
        <div className="field" style={{ marginBottom: 16 }}>
          <label>Diagnosis / Problem Photos (Before Repair)</label>
          <div style={{
            border: '2px dashed var(--border)', borderRadius: 8, padding: 14,
            textAlign: 'center', background: '#F8FAFC', cursor: 'pointer'
          }} onClick={() => document.getElementById('diagPhotoInput')?.click()}>
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'var(--blue)' }}>
              add_a_photo
            </span>
            <span style={{ display: 'block', fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>
              Click to take or upload photos of the damaged part
            </span>
            <input 
              id="diagPhotoInput"
              type="file" 
              accept="image/*" 
              multiple 
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />
          </div>

          {photos.length > 0 && (
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
              {photos.map((p, i) => (
                <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                  <img 
                    src={p.url} 
                    alt="Diagnosis evidence" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)' }} 
                  />
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removePhoto(i); }}
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

        <div className="field" style={{ marginBottom: 20 }}>
          <label htmlFor="diagNotes">Internal notes (Private — for FixMate records)</label>
          <textarea
            id="diagNotes"
            placeholder="Part serial numbers, model number, internal observations, etc."
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ minHeight: 60 }}
          />
        </div>

        <button className="btn btn-primary" onClick={handleNext} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <span className="material-symbols-outlined">arrow_forward</span> 
          Proceed to Build Quote
        </button>
      </div>
    </div>
  );
}
