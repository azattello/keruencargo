import React, { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import QRCode from 'react-qr-code';
import '../components/styles/qr-code.css';

const UserQRCode = () => {
  const currentUser = useSelector(state => state.user.currentUser);
  const qrRef = useRef();
  const [copied, setCopied] = useState(false);

  // Генерируем QR код с номером телефона
  const qrValue = currentUser?.phone ? String(currentUser.phone) : '';

  const downloadQR = () => {
    if (qrRef.current) {
      const image = qrRef.current.querySelector('canvas').toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `QR-${currentUser.phone}.png`;
      link.click();
    }
  };

  const copyPhoneToClipboard = () => {
    navigator.clipboard.writeText(currentUser.phone.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!currentUser) {
    return <div className="qr-code-container"><p>Пожалуйста, авторизуйтесь</p></div>;
  }

  return (
    <div className="qr-code-container">
      <div className="qr-code-section">
        <h2>Мой QR код</h2>
        <p className="qr-description">Покажите этот QR код администратору для быстрого поиска вашей информации</p>
        
        <div className="qr-code-box" ref={qrRef}>
          {qrValue && <QRCode value={qrValue} size={256} level="H" includeMargin={true} />}
        </div>

        <div className="qr-info">
          <p><strong>Номер телефона:</strong> {currentUser.phone}</p>
          <p><strong>Имя:</strong> {currentUser.name} {currentUser.surname}</p>
          {currentUser.level && <p><strong>Уровень:</strong> {currentUser.level}</p>}
        </div>

        <div className="qr-actions">
          <button className="btn-download" onClick={downloadQR}>
            📥 Скачать QR код
          </button>
          <button className="btn-copy" onClick={copyPhoneToClipboard}>
            {copied ? '✅ Скопировано' : '📋 Копировать номер'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserQRCode;
