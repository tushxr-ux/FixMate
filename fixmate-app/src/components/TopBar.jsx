import { useNavigate } from 'react-router-dom';

export default function TopBar({ title, back, backTo, right, onBack }) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => backTo ? navigate(backTo) : navigate(-1));

  return (
    <div className="topbar">
      {back !== false && (
        <button className="icon-btn" onClick={handleBack} aria-label="Go back">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
      )}
      <h2>{title}</h2>
      {right && <div className="topbar-right">{right}</div>}
    </div>
  );
}
