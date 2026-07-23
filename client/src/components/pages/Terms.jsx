import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import BasePage from './BasePage';
import config from '../../config';
import { getFilialSettingsByName } from '../../action/settings';
import '../styles/pages.css';

export default function Terms() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const selectedFilial = useSelector(state => state.user.currentUser.selectedFilial);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        let response;
        if (selectedFilial) {
          response = await getFilialSettingsByName(selectedFilial);
          setSettings(response);
        } else {
          response = await axios.get(`${config.apiUrl}/api/settings/getSettings`);
          setSettings(response.data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [selectedFilial]);
  return (
    <BasePage title="Условия">
      <div className="terms-container">
        <div className="terms-header">
          <h1>Условия использования</h1>
          <p>Ознакомьтесь с информацией о нашем сервисе</p>
        </div>

        {loading ? (
          <p>Загрузка...</p>
        ) : settings ? (
          <>
            {/* Инструкция */}
            {settings.videoLink && (
              <div className="terms-section-item">
                <div className="section-title">📺 Инструкция</div>
                <a 
                  href={settings.videoLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="section-link"
                >
                  Посмотреть видеоинструкцию →
                </a>
              </div>
            )}

            {/* WhatsApp */}
            {settings.whatsappNumber && (
              <div className="terms-section-item">
                <div className="section-title">💬 Связь с нами</div>
                <a 
                  href={`https://wa.me/${settings.whatsappNumber.replace(/\D/g, '')}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="section-link"
                >
                  Написать в WhatsApp →
                </a>
              </div>
            )}

            {/* О нас */}
            {settings.aboutUsText && (
              <div className="terms-section-item">
                <div className="section-title">ℹ️ О нас</div>
                <div className="section-content">
                  {settings.aboutUsText.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Запрещённые товары */}
            {settings.prohibitedItemsText && (
              <div className="terms-section-item">
                <div className="section-title">⛔ Товары которые нельзя заказывать</div>
                <div className="section-content">
                  {settings.prohibitedItemsText.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Адрес китайского склада */}
            {settings.chinaAddress && (
              <div className="terms-section-item">
                <div className="section-title">📍 Адрес китайского склада</div>
                <div className="section-content">
                  <p>{settings.chinaAddress}</p>
                </div>
              </div>
            )}

            {/* Документы */}
            {settings.contractFilePath && (
              <div className="terms-footer">
                <h3>📄 Документы</h3>
                <div className="document-links">
                  <a 
                    href={`${config.apiUrl}${settings.contractFilePath}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="doc-link"
                  >
                    <span>📋</span>
                    <span>Скачать договор и условия</span>
                  </a>
                </div>
              </div>
            )}
          </>
        ) : null}

        <div className="terms-info">
          <p>❓ Остались вопросы? Свяжитесь с нашей поддержкой</p>
        </div>
      </div>
    </BasePage>
  );
}
