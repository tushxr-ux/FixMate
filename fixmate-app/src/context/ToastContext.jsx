import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const baseToast = useCallback((msg, type = '', duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts(ts => [...ts, { id, msg, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), duration);
  }, []);

  // Build the callable toast API (toast.success(...) etc.) in one
  // Object.assign so no property is assigned after creation. Callers use it
  // exactly as before: toast(msg), toast.success(msg), ...
  const toast = useMemo(() => Object.assign(
    (msg, type, d) => baseToast(msg, type, d),
    {
      ok:      (msg, d) => baseToast(msg, 'ok', d),
      success: (msg, d) => baseToast(msg, 'ok', d),
      err:     (msg, d) => baseToast(msg, 'err', d),
      error:   (msg, d) => baseToast(msg, 'err', d),
      warn:    (msg, d) => baseToast(msg, 'warn', d),
      info:    (msg, d) => baseToast(msg, '', d),
    }
  ), [baseToast]);

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
