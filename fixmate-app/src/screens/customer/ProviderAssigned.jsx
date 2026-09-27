import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getProvider } from '../../store';
import TopBar from '../../components/TopBar';
import ProviderCard from '../../components/ProviderCard';

export default function ProviderAssigned() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const job       = getJob(jobId);
  const provider  = job ? getProvider(job.providerId) : null;

  if (!job) { navigate('/home'); return null; }

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
        </div>

        <button className="btn btn-outline" style={{ marginBottom:10 }}
          onClick={() => alert('Calling provider to confirm visit…')}>
          <span className="material-symbols-outlined">call</span> Confirm visit by call
        </button>

        <button className="btn btn-primary" onClick={() => navigate(`/tracking/${jobId}`)}>
          <span className="material-symbols-outlined">location_on</span> Track live location
        </button>
      </div>
    </div>
  );
}
