import { useParams, useNavigate } from 'react-router-dom';
import { getJob } from '../../store';

export default function Done() {
  const { jobId } = useParams();
  const navigate  = useNavigate();
  const job       = getJob(jobId);
  const cancelled = job?.status === 'quote_rejected' || job?.status?.includes('cancel');

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      <div className="body body-center screen-enter">
        <div className={`big-icon${cancelled ? ' warn' : ''}`}>
          <span className="material-symbols-outlined">{cancelled ? 'info' : 'check'}</span>
        </div>
        <h2 style={{ margin:'0 0 6px' }}>
          {cancelled ? 'Job closed' : 'All done!'}
        </h2>
        <p className="muted">
          {cancelled
            ? 'You have paid the visiting fee. Saved to your service history.'
            : 'Repair complete and payment confirmed. Saved to your service history for next time.'}
        </p>
        <div style={{ marginTop: 24, display:'flex', flexDirection:'column', gap:10, width:'100%', maxWidth:300 }}>
          <button className="btn btn-primary" onClick={() => navigate('/history')}>
            <span className="material-symbols-outlined">history</span> View service history
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/home')}>
            <span className="material-symbols-outlined">home</span> Back to home
          </button>
        </div>
      </div>
    </div>
  );
}
