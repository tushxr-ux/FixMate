import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES } from '../../store';
import TopBar from '../../components/TopBar';

export default function Items() {
  const { categoryId } = useParams();
  const navigate       = useNavigate();
  const cat = CATEGORIES.find(c => c.id === categoryId);

  if (!cat) {
    return (
      <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
        <TopBar title="Category not found" back backTo="/home" />
        <div className="body"><p className="muted">Unknown category.</p></div>
      </div>
    );
  }

  // Roadside emergency item gets special handling
  const handleItem = (item) => {
    if (item.n === 'EMERGENCY') {
      navigate('/emergency');
      return;
    }
    navigate(`/request/${cat.id}/${encodeURIComponent(item.n)}`);
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', flex:1 }}>
      <TopBar title={cat.name} back backTo="/home" />

      <div className="body screen-enter">
        <p className="sub">Select what needs help, or describe it below.</p>

        <div className="item-grid">
          {cat.items.map(item => (
            <div key={item.n} className="item-card" onClick={() => handleItem(item)}>
              <span className="material-symbols-outlined"
                style={{ color: item.n === 'EMERGENCY' ? 'var(--red)' : 'var(--blue)' }}>
                {item.i}
              </span>
              <span className="label" style={{ color: item.n === 'EMERGENCY' ? 'var(--red)' : 'inherit' }}>
                {item.n}
              </span>
            </div>
          ))}
        </div>

        <div className="search-bar">
          <span className="material-symbols-outlined">search</span>
          <span>Not listed? Describe your issue…</span>
        </div>
      </div>
    </div>
  );
}
