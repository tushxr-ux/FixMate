import { useNavigate, useLocation } from 'react-router-dom';

const TABS = [
  { path: '/home',    icon: 'home',    label: 'Home' },
  { path: '/history', icon: 'history', label: 'History' },
  { path: '/profile', icon: 'person',  label: 'Profile' },
];

export default function BottomTabs() {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <nav className="bottom-tabs" role="tablist">
      {TABS.map(tab => (
        <button
          key={tab.path}
          className={`tab-btn${location.pathname === tab.path ? ' active' : ''}`}
          onClick={() => navigate(tab.path)}
          role="tab"
          aria-selected={location.pathname === tab.path}
          aria-label={tab.label}
        >
          <span className="material-symbols-outlined"
            style={{ fontVariationSettings: location.pathname === tab.path ? "'FILL' 1" : "'FILL' 0" }}>
            {tab.icon}
          </span>
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
