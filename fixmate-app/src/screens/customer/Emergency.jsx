import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createJob } from '../../store';
import TopBar from '../../components/TopBar';
import { useToast } from '../../context/ToastContext';

export default function Emergency() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const toast     = useToast();

  const [vehicle, setVehicle] = useState('car'); // 'bike' | 'car'
  const [selectedIssue, setSelectedIssue] = useState('');
  const [fuelType, setFuelType] = useState('petrol');
  const [fuelLitres, setFuelLitres] = useState('5');
  const [towDestination, setTowDestination] = useState('Nearest authorized workshop');
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const issues = [
    { id: 'Battery dead',    label: 'Battery Dead',    icon: 'battery_alert',    desc: 'Jumpstart or battery check' },
    { id: 'Tyre puncture',   label: 'Tyre Puncture',   icon: 'tire_repair',      desc: 'Stepney change or puncture fix' },
    { id: 'Fuel out',        label: 'Ran Out of Fuel', icon: 'local_gas_station',desc: 'Emergency fuel delivery to spot' },
    { id: 'Towing',          label: 'Towing Needed',   icon: 'local_shipping',   desc: 'Flatbed or chain tow to garage' },
    { id: 'Engine fault',    label: 'Engine Breakdown',icon: 'build',            desc: 'Overheating, clutch, or starting issue' },
    { id: 'Collision / SOS', label: 'Collision / SOS', icon: 'e911_emergency',   desc: 'Accident or active danger' },
  ];

  function handleSelectIssue(issueId) {
    if (issueId === 'Collision / SOS') {
      setShowSafetyModal(true);
      return;
    }
    setSelectedIssue(issueId);
  }

  function handleDispatch() {
    if (!selectedIssue) {
      toast.warn('Please select the breakdown service needed.');
      return;
    }

    let extraDetails = `Vehicle: ${vehicle === 'car' ? '4-Wheeler (Car/SUV)' : '2-Wheeler (Bike/Scooter)'}`;
    if (selectedIssue === 'Fuel out') {
      extraDetails += ` · Fuel: ${fuelLitres}L of ${fuelType.toUpperCase()}`;
    } else if (selectedIssue === 'Towing') {
      extraDetails += ` · Destination: ${towDestination}`;
    }

    const job = createJob({
      category: 'roadside',
      item: `${vehicle === 'car' ? 'Car' : 'Bike'} — ${selectedIssue}`,
      issue: `ROAD SERVICE: ${selectedIssue}. ${extraDetails}`,
      mode: 'immediate',
      location: location.state?.location || { address: 'Western Express Hwy, Andheri West, Mumbai', lat: 19.1364, lng: 72.8296 },
    });

    if (job) {
      toast.success('Roadside rescue dispatched! Locating nearest mobile mechanic.');
      navigate(`/matching/${job.id}`);
    } else {
      navigate('/login');
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '100%' }}>
      <TopBar title="Roadside Assistance" back backTo="/home" />

      <div className="body screen-enter" style={{ paddingBottom: 32 }}>
        {/* Safety Boundary Banner */}
        <div style={{
          padding: '12px 14px', borderRadius: 8, background: '#FEE2E2',
          border: '1px solid #EF4444', marginBottom: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-symbols-outlined" style={{ color: '#DC2626', fontSize: 22 }}>
              emergency
            </span>
            <div style={{ fontSize: 12, color: '#991B1B' }}>
              <strong>Accident or physical injury?</strong>
              <div style={{ fontSize: 11 }}>Do not wait for mechanic — call 112 immediately.</div>
            </div>
          </div>
          <a
            href="tel:112"
            style={{
              padding: '6px 10px', borderRadius: 6, background: '#DC2626', color: '#fff',
              fontSize: 11, fontWeight: 700, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>call</span> 112
          </a>
        </div>

        {/* Vehicle Selection */}
        <p className="section-title">Select Your Vehicle</p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { id: 'bike', label: '2-Wheeler (Bike/Scooter)', icon: 'two_wheeler' },
            { id: 'car',  label: '4-Wheeler (Car/SUV)',     icon: 'directions_car' },
          ].map(v => (
            <div
              key={v.id}
              onClick={() => setVehicle(v.id)}
              style={{
                flex: 1, padding: '12px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                border: vehicle === v.id ? '2px solid var(--blue)' : '1px solid var(--border)',
                background: vehicle === v.id ? '#EFF6FF' : '#fff'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 28, color: vehicle === v.id ? 'var(--blue)' : 'var(--gray)' }}>
                {v.icon}
              </span>
              <strong style={{ display: 'block', fontSize: 12, marginTop: 4 }}>{v.label}</strong>
            </div>
          ))}
        </div>

        {/* Breakdown Issue Grid */}
        <p className="section-title">What is the Issue?</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {issues.map(o => (
            <div
              key={o.id}
              onClick={() => handleSelectIssue(o.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 8,
                border: selectedIssue === o.id ? '2px solid var(--blue)' : '1px solid var(--border)',
                background: selectedIssue === o.id ? '#EFF6FF' : '#fff', cursor: 'pointer'
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: 8,
                background: o.id === 'Collision / SOS' ? '#FEE2E2' : 'var(--blue-50)',
                color: o.id === 'Collision / SOS' ? '#DC2626' : 'var(--blue)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 22 }}>{o.icon}</span>
              </div>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 14, display: 'block', color: 'var(--text)' }}>{o.label}</strong>
                <span style={{ fontSize: 11, color: 'var(--gray)' }}>{o.desc}</span>
              </div>
              {selectedIssue === o.id && (
                <span className="material-symbols-outlined" style={{ color: 'var(--blue)', fontSize: 20 }}>check_circle</span>
              )}
            </div>
          ))}
        </div>

        {/* Specific logic for Fuel out */}
        {selectedIssue === 'Fuel out' && (
          <div className="prov-card" style={{ marginBottom: 16, background: '#F8FAFC' }}>
            <strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Fuel Requirements</strong>
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              {['petrol', 'diesel'].map(f => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFuelType(f)}
                  className={fuelType === f ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
                  style={{ flex: 1, textTransform: 'capitalize' }}
                >
                  {f}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <label style={{ fontSize: 12 }}>Quantity:</label>
              <select
                value={fuelLitres}
                onChange={e => setFuelLitres(e.target.value)}
                style={{ padding: '6px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
              >
                <option value="3">3 Litres</option>
                <option value="5">5 Litres</option>
                <option value="10">10 Litres</option>
              </select>
            </div>
          </div>
        )}

        {/* Specific logic for Towing */}
        {selectedIssue === 'Towing' && (
          <div className="prov-card" style={{ marginBottom: 16, background: '#F8FAFC' }}>
            <strong style={{ fontSize: 13, display: 'block', marginBottom: 8 }}>Towing Destination</strong>
            <input
              type="text"
              placeholder="e.g. Nearest Authorized Service Center, or Garage Address"
              value={towDestination}
              onChange={e => setTowDestination(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', fontSize: 13 }}
            />
          </div>
        )}

        {/* Dispatch Action */}
        <button
          className="btn btn-primary"
          onClick={handleDispatch}
          disabled={!selectedIssue}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px' }}
        >
          <span className="material-symbols-outlined">bolt</span>
          Dispatch Nearest Roadside Mechanic (₹50 Base Fee)
        </button>

        <p className="muted" style={{ textAlign: 'center', marginTop: 12, fontSize: 11 }}>
          Live GPS location shared with technician immediately upon dispatch.
        </p>
      </div>

      {/* Emergency Collision / SOS Modal */}
      {showSafetyModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, zIndex: 1000
        }}>
          <div style={{
            background: '#fff', borderRadius: 12, padding: 22, maxWidth: 360, width: '100%',
            textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              width: 54, height: 54, borderRadius: '50%', background: '#FEE2E2', color: '#DC2626',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 32 }}>e911_emergency</span>
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18, color: '#991B1B' }}>Active Danger or Accident?</h3>
            <p className="muted" style={{ margin: '0 0 18px', fontSize: 13, lineHeight: 1.5 }}>
              If anyone is injured or there is risk in live traffic, please reach emergency responders immediately. Repair dispatches cannot assist with medical or collision emergencies.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              <a
                href="tel:112"
                className="btn btn-primary"
                style={{ background: '#DC2626', borderColor: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <span className="material-symbols-outlined">call</span> Call 112 (National Emergency)
              </a>
              <a
                href="tel:108"
                className="btn btn-outline"
                style={{ borderColor: '#DC2626', color: '#DC2626', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <span className="material-symbols-outlined">medical_services</span> Call 108 (Ambulance)
              </a>
            </div>

            <button
              className="btn btn-ghost"
              style={{ width: '100%', fontSize: 13 }}
              onClick={() => setShowSafetyModal(false)}
            >
              Cancel / Back to Breakdown Service
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
