import React, { useEffect, useState } from 'react';
import './styles/MainBookmarks.css'; // reuse css file for toasts to avoid adding new css file

let idCounter = 0;
export function showToast(message, type = 'info', timeout = 3500) {
  const id = ++idCounter;
  window.dispatchEvent(new CustomEvent('app-toast', { detail: { id, message, type, timeout } }));
}

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const t = e.detail;
      setToasts((s) => [...s, t]);
      setTimeout(() => {
        setToasts((s) => s.filter(x => x.id !== t.id));
      }, t.timeout || 3500);
    };
    window.addEventListener('app-toast', handler);
    return () => window.removeEventListener('app-toast', handler);
  }, []);

  return (
    <div className="toast-root">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`} role="status">
          {t.message}
        </div>
      ))}
    </div>
  );
}
