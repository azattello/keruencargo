import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import config from '../config';
import { showToast } from './Toast';
import '../components/styles/qr-scanner.css';

const QRScanner = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [scannedPhone, setScannedPhone] = useState(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(false);
  const scanningRef = useRef(false);

  // Инициализация сканера
  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setScanning(true);
        setPermissionDenied(false);
        startScanning();
      }
    } catch (error) {
      console.error('Ошибка доступа к камере:', error);
      setPermissionDenied(true);
      showToast('Не удалось получить доступ к камере', 'error');
    }
  };

  // Сканирование QR кодов
  const startScanning = () => {
    if (scanningRef.current) return;
    scanningRef.current = true;

    const scanLoop = () => {
      if (!videoRef.current || !canvasRef.current || !scanning) {
        scanningRef.current = false;
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.drawImage(videoRef.current, 0, 0);

      // Используем jsQR если доступен
      if (window.jsQR) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = window.jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          handleQRCodeDetected(code.data);
          scanningRef.current = false;
          return;
        }
      }

      requestAnimationFrame(scanLoop);
    };

    scanLoop();
  };

  // Обработка отсканированного QR кода (номер телефона)
  const handleQRCodeDetected = async (qrData) => {
    setScanning(false);
    setScannedPhone(qrData);
    
    // Сразу ищем клиента по номеру
    await searchClientByPhone(qrData);
  };

  // Поиск клиента по номеру телефона
  const searchClientByPhone = async (phone) => {
    if (!phone) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `${config.apiUrl}/api/user/search?phone=${encodeURIComponent(phone)}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );

      if (response.data.user) {
        setClientData(response.data.user);
        showToast('Клиент найден!', 'success');
      } else {
        showToast('Клиент не найден', 'warning');
        setClientData(null);
      }
    } catch (error) {
      console.error('Ошибка при поиске клиента:', error);
      showToast('Ошибка при поиске клиента', 'error');
      setClientData(null);
    } finally {
      setLoading(false);
    }
  };

  // Остановка сканирования
  const stopScanning = () => {
    setScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  // Ручной поиск
  const handleManualSearch = (e) => {
    e.preventDefault();
    const input = e.target.phoneInput.value.trim();
    if (input) {
      searchClientByPhone(input);
      e.target.phoneInput.value = '';
    }
  };

  // Очистка результатов
  const clearResults = () => {
    setClientData(null);
    setScannedPhone(null);
  };

  useEffect(() => {
    return () => {
      stopScanning();
      scanningRef.current = false;
    };
  }, []);

  return (
    <div className="qr-scanner-container">
      <div className="scanner-header">
        <h2>Сканирование клиентов через QR</h2>
        <p>Отсканируйте QR код клиента или введите номер телефона</p>
      </div>

      {permissionDenied ? (
        <div className="permission-denied">
          <p>⚠️ Доступ к камере запрещен</p>
          <p>Пожалуйста, разрешите доступ к камере в настройках браузера</p>
        </div>
      ) : (
        <div className="scanner-section">
          {scanning ? (
            <div className="scanner-active">
              <div className="video-container">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="scanner-video"
                />
                <canvas
                  ref={canvasRef}
                  style={{ display: 'none' }}
                />
                <div className="scanner-overlay">
                  <div className="scanner-frame"></div>
                </div>
              </div>
              <button className="btn-stop" onClick={stopScanning}>
                🛑 Остановить сканирование
              </button>
            </div>
          ) : (
            <button className="btn-start" onClick={initializeCamera}>
              📷 Начать сканирование
            </button>
          )}

          <div className="manual-search">
            <form onSubmit={handleManualSearch}>
              <input
                type="tel"
                name="phoneInput"
                placeholder="Введите номер телефона клиента"
                className="phone-input"
              />
              <button type="submit" className="btn-search">
                🔍 Поиск
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Отображение данных клиента */}
      {loading ? (
        <div className="client-data">
          <p>Загрузка данных клиента...</p>
        </div>
      ) : clientData ? (
        <div className="client-data">
          <div className="client-header">
            <h3>Данные клиента</h3>
            <button className="btn-close" onClick={clearResults}>✕</button>
          </div>

          <div className="client-info">
            <div className="info-row">
              <span className="label">Имя:</span>
              <span className="value">{clientData.name} {clientData.surname}</span>
            </div>

            <div className="info-row">
              <span className="label">Номер телефона:</span>
              <span className="value">{clientData.phone}</span>
            </div>

            <div className="info-row">
              <span className="label">Email:</span>
              <span className="value">{clientData.email || 'Не указан'}</span>
            </div>

            <div className="info-row">
              <span className="label">Статус:</span>
              <span className="value">{clientData.role === 'admin' ? 'Администратор' : 'Клиент'}</span>
            </div>

            <div className="info-row">
              <span className="label">Уровень:</span>
              <span className="value">{clientData.level || 'Стандартный'}</span>
            </div>

            {clientData.filial && (
              <div className="info-row">
                <span className="label">Филиал:</span>
                <span className="value">{clientData.filial}</span>
              </div>
            )}

            <div className="info-row">
              <span className="label">Бонусы:</span>
              <span className="value">{clientData.bonus || 0} 🏆</span>
            </div>

            <div className="info-row">
              <span className="label">Дата регистрации:</span>
              <span className="value">{new Date(clientData.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>

            {clientData.referralCode && (
              <div className="info-row">
                <span className="label">Реферальный код:</span>
                <span className="value">{clientData.referralCode}</span>
              </div>
            )}
          </div>

          <div className="client-actions">
            <button className="btn-scan-another" onClick={() => {
              clearResults();
              initializeCamera();
            }}>
              📷 Отсканировать другого
            </button>
          </div>
        </div>
      ) : scannedPhone && !loading ? (
        <div className="client-data error">
          <p>Клиент с номером {scannedPhone} не найден</p>
          <button className="btn-try-again" onClick={clearResults}>
            Попробовать снова
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default QRScanner;
