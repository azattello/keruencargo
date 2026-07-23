import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import BasePage from './BasePage';
import axios from 'axios';
import config from '../../config';
import { getFilialSettingsByName } from '../../action/settings';
import '../styles/pages.css';

export default function Warehouse() {
  const [warehouseAddress, setWarehouseAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const selectedFilial = useSelector(state => state.user.currentUser?.selectedFilial);

  useEffect(() => {
    const fetchWarehouseAddress = async () => {
      try {
        let address = '';
        if (selectedFilial) {
          // Для клиентов получаем адрес из филиала
          const filialSettings = await getFilialSettingsByName(selectedFilial);
          address = filialSettings?.chinaAddress || '';
        } else {
          // Для остальных - из общих настроек
          const res = await axios.get(`${config.apiUrl}/api/settings/getSettings`);
          address = res.data.warehouseAddress || res.data.chinaAddress || '';
        }
        setWarehouseAddress(address);
      } catch (err) {
        console.error('Ошибка при получении адреса склада:', err.message);
        setWarehouseAddress('');
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouseAddress();
  }, [selectedFilial]);

  const handleCopy = () => {
    navigator.clipboard.writeText(warehouseAddress || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BasePage title="Склад">
      <div className="warehouse-container">
        {loading ? (
          <div className="loading">Загрузка информации о складе...</div>
        ) : (
          <>
            <div className="warehouse-header">
              <h1>Наш склад в Китае</h1>
              <p>Отправьте посылку на этот адрес для дальнейшей доставки в Казахстан</p>
            </div>

            <div className="warehouse-info">
              <div className="warehouse-card">
                <div className="warehouse-icon">🏭</div>
                <h3>Адрес склада</h3>
                <div className="address-box">
                  <p className="address-text">{warehouseAddress || 'Адрес не задан'}</p>
                  <div className="address-actions">
                    <button 
                      className="btn-copy"
                      onClick={handleCopy}
                    >
                      {copied ? '✓ Скопировано' : '📋 Скопировать'}
                    </button>
                    
                  </div>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </BasePage>
  );
}
