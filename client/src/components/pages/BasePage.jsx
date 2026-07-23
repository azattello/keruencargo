import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/page.css';

export default function BasePage({ title, children }) {
  const navigate = useNavigate();
  const goBack = () => {
    // Если в истории есть предыдущая страница — вернёмся назад, иначе перейдём на /main
    try {
      if (window.history && window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/main');
      }
    } catch (e) {
      navigate('/main');
    }
  };

  return (
    <div className="page-root">
      <header className="page-header">
        <button className="back-btn" onClick={goBack} aria-label="Назад">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M15 18L9 12L15 6" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="back-text">Назад</span>
        </button>
        <h2 className="page-title">{title}</h2>
      </header>

      <div className="page-content">
        {children}
      </div>
    </div>
  );
}
