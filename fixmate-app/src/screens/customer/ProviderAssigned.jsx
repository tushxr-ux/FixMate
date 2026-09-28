import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getProvider, saveConfirmationCall } from '../../store';
import TopBar from '../../components/TopBar';
import ProviderCard from '../../components/ProviderCard';

export default function ProviderAssigned() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const [job, setJob] = useState(() => getJob(jobId));
  const provider  = job ? getProvider(job.providerId) : null;

  if (!job) { navigate('/home'); return null; }

  function handleConfirmCall() {
    // §2.2: persist timestamped confirmation call event to job
    saveConfirmationCall(jobId, 'provider');
    const updated = getJob(jobId);
    setJob(updated);
    alert('Call logged! Confirmation timestamped in job record.');
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      <TopBar title="Provider assigned" back={false} />

      <div className="body screen-enter">
        <div className="banner ok" style={{ display:'block' }}>
          ✓ Provider confirmed — you&apos;ll receive a call to verify your address and visit time.
        </div>

        <ProviderCard provider={provider} />

        <div className="prov-card" style={{ marginBottom: 16 }}>
          <p className="section-title" style={{ marginBottom: 8 }}>Job summary</p>
          <div style={{ display:'flex', gap: 12 }}>
            <div style={{ flex:1 }}>
              <span className="muted" style={{ fontSize:12 }}>Item</span>
              <div style={{ fontWeight:700 }}>{job.item}</div>
            </div>
            <div style={{ flex:2 }}>
              <span className="muted" style={{ fontSize:12 }}>Issue</span>
              <div style={{ fontWeight:600 }}>{job.issue}</div>
            </div>
          </div>
          {job.confirmationCall && (
            <div style={{ marginTop: 10, padding: '8px 10px', background: 'var(--green-bg, #DCFCE7)', borderRadius: 6, fontSize: 12, color: 'var(--green, #16A34A)' }}>
              ✓ Confirmation call logged at {new Date(job.confirmationCall.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} by {job.confirmationCall.confirmedBy}
            </div>
          )}
        </div>

        <button className="btn btn-outline" style={{ marginBottom:10 }}
          onClick={handleConfirmCall}>
          <span className="material-symbols-outlined">call</span> Confirm visit by call
        </button>

        <button className="btn btn-primary" onClick={() => navigate(`/tracking/${jobId}`)}>
          <span className="material-symbols-outlined">location_on</span> Track live location
        </button>
      </div>
    </div>
  );
}
