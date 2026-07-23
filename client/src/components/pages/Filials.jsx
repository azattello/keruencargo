import React, { useEffect, useState } from 'react';
import BasePage from './BasePage';
import axios from 'axios';
import config from '../../config';

export default function Filials() {
  const [filials, setFilials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/api/filial/getFilial`);
        setFilials(res.data || []);
      } catch (err) {
        console.error('Ошибка при получении филиалов:', err.message);
        setFilials([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <BasePage title="Филиалы">
      <div className="page-card">
        <h3>Наши филиалы</h3>
        {loading ? (
          <p>Загрузка...</p>
        ) : filials.length ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {filials.map((f, idx) => (
              <div key={idx} className="filial-el" style={{ padding: 12 }}>
                <div>
                  <h4 style={{ margin: 0 }}>{f.filial.filialName ? f.filial.filialName : f.filial.filialText}</h4>
                  <div style={{ color: '#444' }}>{f.filial.filialAddress}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Филиалы не найдены</p>
        )}
      </div>
    </BasePage>
  );
}
