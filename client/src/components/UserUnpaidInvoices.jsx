// 📦 Компонент: Показывает неоплаченные счета пользователя
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';

const UserUnpaidInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.apiUrl}/api/auth/invoices`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setInvoices(response.data.invoices);
      } catch (err) {
        if (err.response?.status === 204) {
            setInvoices([]); // нет счетов
          } else {
            setInvoices([]); // 👈 безопасный fallback
            setError('Ошибка при загрузке счетов');
          }
          
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!Array.isArray(invoices) || invoices.length === 0) return null;  // ничего не показывать, если нет счетов

  return (
    <div className="invoice-section">
      <h3>
        <br />
        Неоплаченные счета</h3>
      {invoices.map((inv, index) => (
        <div key={index} className="invoice-box red-bg">
          <p><strong>Дата:</strong> {formatDate(inv.date)}</p>
          <p><strong>Товаров:</strong> {inv.itemCount}</p>
          <p><strong>Вес:</strong> {inv.totalWeight} кг</p>
          <p><strong>Сумма:</strong> {inv.totalAmount} тг</p>
          <p><strong>Статус:</strong> Не оплачено</p>
        </div>
      ))}
    </div>
  );
};

export default UserUnpaidInvoices;
