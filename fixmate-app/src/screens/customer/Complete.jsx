import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, saveJob, fmt } from '../../store';
import { useToast } from '../../context/ToastContext';
import TopBar from '../../components/TopBar';
import LineItems from '../../components/LineItems';
import Stars from '../../components/Stars';

export default function Complete() {
  const { jobId }   = useParams();
  const navigate    = useNavigate();
  const toast       = useToast();
  const job         = getJob(jobId);

  const [rating,   setRating]  = useState(5);
  const [paying,   setPaying]  = useState(false);
  const [paid,     setPaid]    = useState(false);
  const [method,   setMethod]  = useState('upi');

  if (!job) { navigate('/home'); return null; }

  async function handlePay() {
    setPaying(true);
    await new Promise(r => setTimeout(r, 900));
    const txnId = 'TXN' + Date.now().toString(36).toUpperCase();
    const updated = {
      ...job,
      status: 'completed',
      rating,
      paymentMethod: method,
      txnId,
      paidAt: Date.now()
    };
    saveJob(updated);
    setPaid(true);
    setPaying(false);
    toast.success('Payment successful! Transaction recorded.');
  }

  function handleDone() {
    navigate(`/done/${jobId}`);
  }

  const METHODS = [
    { id:'upi',    label:'UPI',           icon:'account_balance' },
    { id:'card',   label:'Card',          icon:'credit_card' },
    { id:'wallet', label:'Wallet',        icon:'account_balance_wallet' },
    { id:'cash',   label:'Cash on Spot',  icon:'payments' },
  ];

  if (paid) {
    return (
      <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
        <TopBar title="Payment successful" back={false} />
        <div className="body body-center screen-enter">
          <div className="big-icon">
            <span className="material-symbols-outlined">check_circle</span>
          </div>
          <h2 style={{ margin:'0 0 6px' }}>Payment confirmed!</h2>
          <p className="muted">Transaction ID: <strong>{job.txnId || ('TXN' + jobId.slice(-8).toUpperCase())}</strong></p>
          <p className="muted" style={{ marginTop:4 }}>Amount: <strong>{fmt(job.total)}</strong> · Method: <span style={{ textTransform:'uppercase' }}>{job.paymentMethod || 'UPI'}</span></p>
          <button className="btn btn-primary" style={{ marginTop:24, maxWidth:280 }}
            onClick={() => navigate(`/job/${jobId}`)}>
            <span className="material-symbols-outlined">receipt_long</span> View Official Invoice
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      <TopBar title="Job complete — pay" back={false} />

      <div className="body screen-enter">
        <div className="banner ok" style={{ display:'block', marginBottom:16 }}>
          ✅ Repair completed. Please review and pay.
        </div>

        <p className="section-title">Final bill</p>
        <LineItems
          visitingFee={job.visitingFee}
          parts={job.parts || []}
          labour={job.labour || 0}
          addOns={job.addOns || []}
          total={job.total}
        />

        <p className="section-title" style={{ marginTop:16 }}>Payment method</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:16 }}>
          {METHODS.map(m => (
            <div key={m.id}
              className={`item-card${method===m.id?' ':''}`}
              style={{ border: method===m.id?'2px solid var(--blue)':'', background: method===m.id?'var(--blue-light)':'' }}
              onClick={() => setMethod(m.id)}>
              <span className="material-symbols-outlined" style={{ color:'var(--blue)' }}>{m.icon}</span>
              <span className="label">{m.label}</span>
            </div>
          ))}
        </div>

        <p className="section-title">Rate your provider</p>
        <Stars initial={5} onChange={setRating} />

        <button
          className={`btn btn-primary${paying?' loading':''}`}
          onClick={handlePay}
          disabled={paying}
          style={{ fontSize:16 }}
        >
          {!paying && <><span className="material-symbols-outlined">payments</span> Pay {fmt(job.total)}</>}
        </button>
      </div>
    </div>
  );
}
