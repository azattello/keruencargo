import React, { useEffect, useState } from 'react';
import BasePage from './BasePage';
import axios from 'axios';
import config from '../../config';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/api/settings/getSettings`);
        setSettings(res.data);
      } catch (err) {
        console.error('Ошибка при получении настроек:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <BasePage title="Настройки">
      <div className="page-card">
        <h3>Настройки</h3>
        {loading ? <p>Загрузка...</p> : (
          settings ? (
            <div>
              <p><strong>Условия (файл):</strong> {settings.contractFilePath ? (<a href={settings.contractFilePath} target="_blank" rel="noreferrer">Открыть</a>) : 'не загружен'}</p>
              <p><strong>Адрес склада (chinaAddress):</strong> {settings.chinaAddress || 'не указан'}</p>
              <p><strong>Номер WhatsApp менеджера:</strong> {settings.whatsappNumber || 'не указан'}</p>
            </div>
          ) : (
            <p>Настройки не заданы</p>
          )
        )}
      </div>
    </BasePage>
  );
}