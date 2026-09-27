import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = '', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), duration);
  }, []);

  toast.ok      = useCallback((msg, d) => toast(msg, 'ok', d), [toast]);
  toast.success = useCallback((msg, d) => toast(msg, 'ok', d), [toast]);
  toast.err     = useCallback((msg, d) => toast(msg, 'err', d), [toast]);
  toast.error   = useCallback((msg, d) => toast(msg, 'err', d), [toast]);
  toast.warn    = useCallback((msg, d) => toast(msg, 'warn', d), [toast]);
  toast.info    = useCallback((msg, d) => toast(msg, '', d), [toast]);

  const icons = { ok: 'check_circle', err: 'error', warn: 'warning', '': 'info' };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              {icons[t.type] || 'info'}
            </span>
            <span>{t.msg}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
