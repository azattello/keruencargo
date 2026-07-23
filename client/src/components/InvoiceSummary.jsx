import React, { useEffect, useState } from 'react';
import axios from 'axios';
import config from '../config';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const InvoiceSummary = ({ userId, newBookmarks }) => {
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const generateOrUpdateInvoice = async () => {
      try {
        // Отправляем POST-запрос для обновления/создания счета и сразу получаем обновленный счет
        const response = await axios.post(`${config.apiUrl}/api/invoice/${userId}/update-invoice`, {
          newBookmarks: newBookmarks.filter(b => b.price && b.weight) // Передаем только валидные закладки
        });
  
        // Сохраняем ответ, который содержит обновленный неоплаченный счет
        setInvoice(response.data);
      } catch (err) {
        console.error("Ошибка при обновлении и получении счета:", err);
        setError(`Ошибка при обновлении и получении счета: ${err.response ? err.response.data.message : err.message}`);
      } finally {
        setLoading(false);
      }
    };
  
    // Проверяем наличие пользователя и всегда вызываем запрос
    if (userId) {
      generateOrUpdateInvoice();
    }
  }, [userId, newBookmarks]);

  // Пока идет загрузка
  if (loading) {
    return <div className='invoice__text'>Загрузка счета...</div>;
  }

  // Если возникла ошибка
  if (error) {
    return <div className='invoice__text'>{error}</div>;
  }

  // Если счет пустой или все значения равны 0
  if (!invoice || (invoice.totalItems === 0 && invoice.totalAmount === 0 && invoice.totalWeight === 0)) {
    return <div className='invoice__text'>Нет неоплаченных счетов</div>; // Отображаем сообщение, если счета нет
  }

  // Рендерим компонент счета только если счет валиден
  return (
    <div className="invoice-summary">
      <div className="invoice-card">
        <h2>Счёт за доставку от {formatDate(invoice.createdAt)}</h2>
        <p>Поступило заказов - {invoice.totalItems} шт</p>
        <p>Вес {invoice.totalWeight} кг, сумма к оплате {invoice.totalAmount} ₸</p>
      </div>
    </div>
  );
};

export default InvoiceSummary;
