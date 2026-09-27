export default function EmptyState({ icon = '📭', title, body, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{body}</p>
      {action && (
        <button className="btn btn-primary" style={{ marginTop: 8, width: 'auto', padding: '10px 24px' }}
          onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
