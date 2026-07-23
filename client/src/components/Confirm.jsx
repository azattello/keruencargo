import React, { useEffect, useState } from 'react';

let confirmId = 0;
export function openConfirm(message) {
  return new Promise((resolve) => {
    const id = ++confirmId;
    window.dispatchEvent(new CustomEvent('app-confirm', { detail: { id, message, resolve } }));
  });
}

export default function Confirm() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const handler = (e) => {
      const { id, message, resolve } = e.detail;
      setState({ id, message, resolve });
    };
    window.addEventListener('app-confirm', handler);
    return () => window.removeEventListener('app-confirm', handler);
  }, []);

  if (!state) return null;

  const { message, resolve } = state;

  const close = (answer) => {
    try { resolve(!!answer); } catch (err) { /* noop */ }
    setState(null);
  };

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <div className="confirm-message">{message}</div>
        <div className="confirm-actions">
          <button className="btn-cancel" onClick={() => close(false)}>Отмена</button>
          <button className="btn-save" onClick={() => close(true)}>Удалить</button>
        </div>
      </div>
    </div>
  );
}
