import React, { useEffect, useState } from 'react';
import BasePage from './BasePage';
import axios from 'axios';
import config from '../../config';

export default function Invoices() {
  const [invoices, setInvoices] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${config.apiUrl}/api/auth/invoices`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        setInvoices(res.data.invoices || []);
      } catch (err) {
        if (err.response && err.response.status === 204) setInvoices([]);
        else console.error('Ошибка при получении счетов:', err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <BasePage title="Счета">
      <div className="page-card" style={{ padding: 20, borderRadius: 12, background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
        <h3 style={{ marginBottom: 16 }}>Мои счета</h3>

        {loading && <p>Загрузка...</p>}

        {!loading && (!invoices || invoices.length === 0) && (
          <p>Счета отсутствуют</p>
        )}

        {!loading && invoices && invoices.length > 0 && (
          <div style={{ display: 'grid', gap: 12 }}>
            {invoices.map((inv) => (
              <div key={inv._id || `${inv.date}-${inv.totalAmount}`} style={{ border: '1px solid #e5e5ea', padding: 14, borderRadius: 10, background: '#f8f9fa' }}>
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong>{inv.invoiceNumber || 'Счет'}</strong>
                  <span style={{ color: inv.status === 'paid' ? '#198754' : inv.status === 'cancelled' ? '#dc3545' : '#fd7e14', fontWeight: 600 }}>
                    {inv.status === 'paid' ? 'Оплачен' : inv.status === 'cancelled' ? 'Отменен' : 'Не оплачен'}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Дата: {inv.date ? new Date(inv.date).toLocaleDateString() : '-'}</div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Сумма: {inv.totalAmount || inv.amount || 0} ₸</div>
                {typeof inv.itemCount !== 'undefined' && inv.itemCount !== null && (
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Количество: {inv.itemCount} шт</div>
                )}
                {typeof inv.totalWeight !== 'undefined' && inv.totalWeight !== null && (
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 4 }}>Вес: {inv.totalWeight} кг</div>
                )}
                {inv.description && inv.description.trim() && (
                  <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: '#fff', color: '#333', fontSize: 13 }}>
                    {inv.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </BasePage>
  );
}
