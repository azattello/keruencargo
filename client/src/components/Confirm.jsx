import React, { useEffect, useState } from 'react';

let confirmId = 0;
export function openConfirm(message, confirmLabel = 'Подтвердить') {
  return new Promise((resolve) => {
    const id = ++confirmId;
    window.dispatchEvent(new CustomEvent('app-confirm', { detail: { id, message, confirmLabel, resolve } }));
  });
}

export default function Confirm() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const { id, message, confirmLabel, resolve } = e.detail;
      setState({ id, message, confirmLabel, resolve });
    };
    window.addEventListener('app-confirm', handler);
    return () => window.removeEventListener('app-confirm', handler);
  }, []);

  if (!state) return null;

  const { message, confirmLabel, resolve } = state;

  const close = (answer) => {
    try { resolve(!!answer); } catch (err) { /* noop */ }
    setState(null);
  };

  return (
    <div className="app-confirm-overlay">
      <div className="app-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="app-confirm-message">
        <div id="app-confirm-message" className="app-confirm-message">{message}</div>
        <div className="app-confirm-actions">
          <button className="app-confirm-cancel" onClick={() => close(false)}>Отмена</button>
          <button className="app-confirm-submit" onClick={() => close(true)}>
            <span className="app-confirm-submit-label">{String(confirmLabel || 'Подтвердить')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
