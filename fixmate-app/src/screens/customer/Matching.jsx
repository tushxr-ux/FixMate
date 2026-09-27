import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getProviders, saveJob } from '../../store';
import TopBar from '../../components/TopBar';

const STEPS = [
  'Looking for nearby specialists…',
  'Checking availability…',
  'Calculating distance…',
  'Found a great match!',
];

export default function Matching() {
  const { jobId }  = useParams();
  const navigate   = useNavigate();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const job = getJob(jobId);
    if (!job) { navigate('/home'); return; }

    // Cycle through status messages
    let current = 0;
    const msgInterval = setInterval(() => {
      current++;
      if (current < STEPS.length - 1) setStep(current);
    }, 700);

    // After 2.5s, pick provider and advance
    const done = setTimeout(() => {
      clearInterval(msgInterval);
      setStep(STEPS.length - 1);

      // Match provider from store
      const provs = getProviders({ category: job.category, available: true });
      const matched = provs[0];
      if (matched) {
        const updated = { ...job, providerId: matched.id, status: 'matched' };
        saveJob(updated);
        setTimeout(() => navigate(`/provider-assigned/${jobId}`), 700);
      } else {
        // No provider — go to no-provider fallback (Phase 7)
        navigate(`/no-provider?jobId=${jobId}`);
      }
    }, 2500);

    return () => { clearInterval(msgInterval); clearTimeout(done); };
  }, [jobId, navigate]);

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      <TopBar title="Finding a provider" back={false} />

      <div className="body body-center screen-enter">
        <div className="pulse-ring">
          <span className="material-symbols-outlined">bolt</span>
        </div>
        <h3 style={{ margin:'0 0 6px', fontSize:17 }}>{STEPS[step]}</h3>
        <p className="muted">Matching by skill, distance &amp; rating</p>
        <div style={{ marginTop: 24, display:'flex', gap:6 }}>
          {STEPS.slice(0,-1).map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i <= step ? 'var(--blue)' : 'var(--border)',
              transition: 'background .3s',
            }} />
          ))}
        </div>
      </div>
    </div>
  );
}
